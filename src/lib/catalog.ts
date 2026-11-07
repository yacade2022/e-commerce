/**
 * Catalog service. Every page reads products through these functions, so the
 * mock snapshot can be swapped for a real API by reimplementing this module.
 */
import { rawProducts } from "@/data/products.generated";
import { categories, departments, variantRules } from "@/data/taxonomy";
import type {
  CatalogQuery,
  CatalogResult,
  Category,
  Department,
  DepartmentSlug,
  Facet,
  Product,
  RawProduct,
} from "@/lib/types";

export const DEFAULT_PAGE_SIZE = 24;

const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
const departmentBySlug = new Map(departments.map((d) => [d.slug, d]));

function toProduct(raw: RawProduct): Product | null {
  const category = categoryBySlug.get(raw.category);
  if (!category) return null;
  return {
    ...raw,
    department: category.department,
    categoryLabel: category.label,
    variants: variantRules[raw.category] ?? [],
  };
}

const allProducts: Product[] = rawProducts
  .map(toProduct)
  .filter((p): p is Product => p !== null);

const productBySlug = new Map(allProducts.map((p) => [p.slug, p]));

/* ---------- Taxonomy ---------- */

export function getDepartments(): Department[] {
  return departments;
}

export function getDepartment(slug: string): Department | undefined {
  return departmentBySlug.get(slug as DepartmentSlug);
}

export function getCategory(slug: string): Category | undefined {
  return categoryBySlug.get(slug);
}

export function isDepartmentSlug(value: string): value is DepartmentSlug {
  return departmentBySlug.has(value as DepartmentSlug);
}

/* ---------- Products ---------- */

export async function getAllProductSlugs(): Promise<string[]> {
  return allProducts.map((p) => p.slug);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return productBySlug.get(slug);
}

export async function getRelatedProducts(product: Product, limit = 6): Promise<Product[]> {
  const sameCategory = allProducts.filter(
    (p) => p.category === product.category && p.id !== product.id,
  );
  const sameDepartment = allProducts.filter(
    (p) => p.department === product.department && p.category !== product.category,
  );
  return [...sameCategory, ...sameDepartment].slice(0, limit);
}

/** Largest markdowns that are in stock, one per category first for variety. */
export async function getDeals(limit = 8): Promise<Product[]> {
  const sorted = allProducts
    .filter((p) => p.listPrice && p.stock > 0)
    .sort((a, b) => savingsRatio(b) - savingsRatio(a));
  const picked: Product[] = [];
  const seen = new Set<string>();
  for (const p of sorted) {
    if (seen.has(p.category)) continue;
    seen.add(p.category);
    picked.push(p);
    if (picked.length === limit) return picked;
  }
  return [...picked, ...sorted.filter((p) => !picked.includes(p))].slice(0, limit);
}

/** A cover product per department, used for imagery on department tiles. */
export async function getDepartmentCovers(): Promise<Record<DepartmentSlug, Product[]>> {
  const covers = {} as Record<DepartmentSlug, Product[]>;
  for (const d of departments) {
    covers[d.slug] = d.categories
      .map((c) => allProducts.find((p) => p.category === c))
      .filter((p): p is Product => Boolean(p))
      .slice(0, 3);
  }
  return covers;
}

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  return slugs.map((s) => productBySlug.get(s)).filter((p): p is Product => Boolean(p));
}

/** Lightweight list for client-side search suggestions. */
export function getSearchSuggestions() {
  return allProducts.map((p) => ({
    slug: p.slug,
    title: p.title,
    thumbnail: p.thumbnail,
    categoryLabel: p.categoryLabel,
  }));
}

export function getDepartmentCount(slug: DepartmentSlug): number {
  return allProducts.filter((p) => p.department === slug).length;
}

/* ---------- Search ---------- */

function savingsRatio(p: Product): number {
  return p.listPrice ? 1 - p.price / p.listPrice : 0;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Strips a trailing plural "s" so "shoes" matches "shoe" and vice versa. */
function stem(token: string): string {
  return token.length > 3 && token.endsWith("s") ? token.slice(0, -1) : token;
}

interface Indexed {
  product: Product;
  title: string;
  haystack: string;
}

const searchIndex: Indexed[] = allProducts.map((product) => ({
  product,
  title: normalize(product.title),
  haystack: normalize(
    [
      product.title,
      product.brand ?? "",
      product.categoryLabel,
      departmentBySlug.get(product.department)?.label ?? "",
      product.tags.join(" "),
      product.description,
    ].join(" "),
  ),
}));

/** Returns a relevance score, or 0 when not every query term matches. */
function score(entry: Indexed, terms: string[]): number {
  let total = 0;
  for (const term of terms) {
    if (entry.title.includes(term)) total += 3;
    else if (entry.haystack.includes(term)) total += 1;
    else return 0;
  }
  return total;
}

function facetCounts<T>(items: Product[], key: (p: Product) => T | null, label: (v: T) => string): Facet[] {
  const counts = new Map<T, number>();
  for (const p of items) {
    const v = key(p);
    if (v === null) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()].map(([value, count]) => ({
    value: String(value),
    label: label(value),
    count,
  }));
}

export async function searchProducts(query: CatalogQuery): Promise<CatalogResult> {
  const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
  const terms = query.q ? normalize(query.q).split(" ").filter(Boolean).map(stem) : [];

  // 1. Text match
  let matched: { product: Product; score: number }[] = searchIndex
    .map((entry) => ({ product: entry.product, score: terms.length ? score(entry, terms) : 1 }))
    .filter((m) => m.score > 0);

  // Department facet counts reflect the text query only.
  const departmentFacets = departments
    .map((d) => ({
      value: d.slug,
      label: d.label,
      count: matched.filter((m) => m.product.department === d.slug).length,
    }))
    .filter((f) => f.count > 0);

  // 2. Department / category scope
  if (query.department) matched = matched.filter((m) => m.product.department === query.department);
  if (query.category) matched = matched.filter((m) => m.product.category === query.category);

  const scoped = matched.map((m) => m.product);
  const categoryFacets = facetCounts(
    scoped,
    (p) => p.category,
    (slug) => categoryBySlug.get(slug)?.label ?? slug,
  ).sort((a, b) => a.label.localeCompare(b.label));
  const brandFacets = facetCounts(scoped, (p) => p.brand, (b) => b).sort((a, b) =>
    a.label.localeCompare(b.label),
  );
  const prices = scoped.map((p) => p.price);
  const priceRange = {
    min: prices.length ? Math.floor(Math.min(...prices)) : 0,
    max: prices.length ? Math.ceil(Math.max(...prices)) : 0,
  };

  // 3. Refinements
  if (query.brands?.length) {
    const brands = new Set(query.brands);
    matched = matched.filter((m) => m.product.brand && brands.has(m.product.brand));
  }
  if (query.minPrice !== undefined) matched = matched.filter((m) => m.product.price >= query.minPrice!);
  if (query.maxPrice !== undefined) matched = matched.filter((m) => m.product.price <= query.maxPrice!);
  if (query.inStock) matched = matched.filter((m) => m.product.stock > 0);
  if (query.onSale) matched = matched.filter((m) => m.product.listPrice !== null);

  // 4. Sort
  const sort = query.sort ?? "featured";
  matched.sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.product.price - b.product.price;
      case "price-desc":
        return b.product.price - a.product.price;
      case "savings":
        return savingsRatio(b.product) - savingsRatio(a.product);
      case "name":
        return a.product.title.localeCompare(b.product.title);
      default:
        // Relevance, then in-stock first, then original catalog order.
        return b.score - a.score || Number(b.product.stock > 0) - Number(a.product.stock > 0);
    }
  });

  // 5. Paginate
  const total = matched.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, query.page ?? 1), pageCount);
  const items = matched.slice((page - 1) * pageSize, page * pageSize).map((m) => m.product);

  return {
    items,
    total,
    page,
    pageCount,
    pageSize,
    facets: { departments: departmentFacets, categories: categoryFacets, brands: brandFacets, priceRange },
  };
}
