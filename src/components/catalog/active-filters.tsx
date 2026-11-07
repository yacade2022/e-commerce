import Link from "next/link";
import { XIcon } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { catalogHref } from "@/lib/search-params";
import type { CatalogQuery } from "@/lib/types";

interface Chip {
  label: string;
  href: string;
}

export function ActiveFilters({ query }: { query: CatalogQuery }) {
  const chips: Chip[] = [];
  const without = (changes: Partial<CatalogQuery>) => catalogHref({ ...query, ...changes, page: 1 });

  if (query.q) chips.push({ label: `“${query.q}”`, href: without({ q: undefined }) });
  for (const b of query.brands ?? []) {
    chips.push({ label: b, href: without({ brands: query.brands?.filter((x) => x !== b) }) });
  }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    const label =
      query.minPrice !== undefined && query.maxPrice !== undefined
        ? `${formatPrice(query.minPrice)} to ${formatPrice(query.maxPrice)}`
        : query.minPrice !== undefined
          ? `${formatPrice(query.minPrice)} and up`
          : `Under ${formatPrice(query.maxPrice!)}`;
    chips.push({ label, href: without({ minPrice: undefined, maxPrice: undefined }) });
  }
  if (query.inStock) chips.push({ label: "In stock", href: without({ inStock: false }) });
  if (query.onSale) chips.push({ label: "On sale", href: without({ onSale: false }) });

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters" role="group">
      {chips.map((c) => (
        <Link
          key={c.label}
          href={c.href}
          scroll={false}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border bg-white pr-2 pl-3 text-sm hover:bg-accent"
        >
          {c.label}
          <XIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">(remove filter)</span>
        </Link>
      ))}
      <Link
        href={catalogHref({ department: query.department, category: query.category, sort: query.sort })}
        scroll={false}
        className="ml-1 text-sm font-medium text-spruce underline-offset-2 hover:underline"
      >
        Clear all
      </Link>
    </div>
  );
}
