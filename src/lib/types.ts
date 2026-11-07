/** Shape of a product as stored in the mock data snapshot. */
export interface RawProduct {
  id: string;
  slug: string;
  title: string;
  description: string;
  brand: string | null;
  category: string;
  tags: string[];
  /** Current selling price in USD. */
  price: number;
  /** Original price before markdown, when the item is on sale. */
  listPrice: number | null;
  stock: number;
  sku: string;
  /** Units are not specified by the source dataset, so these are not displayed. */
  weight: number;
  dimensions: { width: number; height: number; depth: number };
  warranty: string;
  shipping: string;
  returnPolicy: string;
  images: string[];
  thumbnail: string;
}

export interface VariantOption {
  /** Display label, also used as the stored value. */
  label: string;
  /** Price adjustment added to the base price, in USD. */
  priceDelta: number;
}

export interface VariantGroup {
  /** e.g. "Storage", "Size" */
  name: string;
  options: VariantOption[];
}

export interface Product extends RawProduct {
  department: DepartmentSlug;
  categoryLabel: string;
  variants: VariantGroup[];
}

export type DepartmentSlug =
  | "electronics"
  | "home-kitchen"
  | "fashion"
  | "accessories"
  | "beauty"
  | "sports"
  | "groceries";

export interface Category {
  slug: string;
  label: string;
  department: DepartmentSlug;
}

export interface Department {
  slug: DepartmentSlug;
  label: string;
  /** Wayfinding number shown as the store aisle. */
  aisle: number;
  blurb: string;
  categories: string[];
}

export type SortOption = "featured" | "price-asc" | "price-desc" | "savings" | "name";

export interface CatalogQuery {
  q?: string;
  department?: DepartmentSlug;
  category?: string;
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface Facet {
  value: string;
  label: string;
  count: number;
}

export interface CatalogResult {
  items: Product[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
  facets: {
    departments: Facet[];
    categories: Facet[];
    brands: Facet[];
    priceRange: { min: number; max: number };
  };
}

/** Selected variant values, keyed by group name. */
export type SelectedOptions = Record<string, string>;

export interface CartItem {
  /** Unique per product + option combination. */
  key: string;
  productId: string;
  slug: string;
  title: string;
  brand: string | null;
  image: string;
  unitPrice: number;
  options: SelectedOptions;
  quantity: number;
  maxQuantity: number;
}
