import type { CatalogQuery, DepartmentSlug, SortOption } from "@/lib/types";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Best match" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "savings", label: "Biggest savings" },
  { value: "name", label: "Name: A to Z" },
];

const sortValues = new Set<string>(sortOptions.map((o) => o.value));

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function all(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return (Array.isArray(v) ? v : [v]).flatMap((s) => s.split(",")).filter(Boolean);
}

function num(v: string | undefined): number | undefined {
  if (v === undefined || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/**
 * Parses URL search params into a catalog query. Invalid values are dropped
 * rather than throwing, so hand-edited URLs still render a sensible page.
 */
export function parseCatalogQuery(
  params: RawSearchParams,
  isDepartment: (v: string) => v is DepartmentSlug,
): CatalogQuery {
  const dept = first(params.dept);
  const sort = first(params.sort);
  const page = num(first(params.page));
  let minPrice = num(first(params.min));
  let maxPrice = num(first(params.max));
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }
  return {
    q: first(params.q)?.trim().slice(0, 100) || undefined,
    department: dept && isDepartment(dept) ? dept : undefined,
    category: first(params.category) || undefined,
    brands: all(params.brand),
    minPrice,
    maxPrice,
    inStock: first(params.stock) === "1",
    onSale: first(params.sale) === "1",
    sort: sort && sortValues.has(sort) ? (sort as SortOption) : "featured",
    page: page ? Math.floor(page) : 1,
  };
}

/** Serializes a query back into a URL, omitting defaults. */
export function catalogHref(query: CatalogQuery): string {
  const sp = new URLSearchParams();
  if (query.q) sp.set("q", query.q);
  if (query.department) sp.set("dept", query.department);
  if (query.category) sp.set("category", query.category);
  for (const b of query.brands ?? []) sp.append("brand", b);
  if (query.minPrice !== undefined) sp.set("min", String(query.minPrice));
  if (query.maxPrice !== undefined) sp.set("max", String(query.maxPrice));
  if (query.inStock) sp.set("stock", "1");
  if (query.onSale) sp.set("sale", "1");
  if (query.sort && query.sort !== "featured") sp.set("sort", query.sort);
  if (query.page && query.page > 1) sp.set("page", String(query.page));
  const s = sp.toString();
  return s ? `/search?${s}` : "/search";
}
