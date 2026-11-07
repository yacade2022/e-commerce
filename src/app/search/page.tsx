import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchXIcon } from "lucide-react";
import { ActiveFilters } from "@/components/catalog/active-filters";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { MobileFilters } from "@/components/catalog/mobile-filters";
import { Pagination } from "@/components/catalog/pagination";
import { SortSelect } from "@/components/catalog/sort-select";
import { EmptyState } from "@/components/common/empty-state";
import { ProductGrid } from "@/components/product/product-card";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategory, getDepartment, isDepartmentSlug, searchProducts } from "@/lib/catalog";
import { catalogHref, parseCatalogQuery, type RawSearchParams } from "@/lib/search-params";
import type { CatalogQuery } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shop all products",
  description: "Search and filter the Stockroom demo catalog.",
};

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="container-page py-6 lg:py-8">
      <Suspense fallback={<CatalogSkeleton />}>
        <Catalog searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function headingFor(query: CatalogQuery): { title: string; context?: string } {
  const dept = query.department ? getDepartment(query.department) : undefined;
  const cat = query.category ? getCategory(query.category) : undefined;
  const scope = cat?.label ?? dept?.label;
  if (query.q) return { title: `Results for “${query.q}”`, context: scope ? `in ${scope}` : undefined };
  if (scope) return { title: scope, context: dept ? `Aisle ${dept.aisle}` : undefined };
  if (query.onSale) return { title: "Today’s deals" };
  return { title: "All products" };
}

async function Catalog({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const query = parseCatalogQuery(await searchParams, isDepartmentSlug);
  const result = await searchProducts(query);
  const { title, context } = headingFor(query);
  const activeCount =
    (query.brands?.length ?? 0) +
    (query.minPrice !== undefined || query.maxPrice !== undefined ? 1 : 0) +
    (query.inStock ? 1 : 0) +
    (query.onSale ? 1 : 0);
  const firstItem = (result.page - 1) * result.pageSize + 1;
  const lastItem = firstItem + result.items.length - 1;

  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_1fr] lg:gap-10">
      <aside className="hidden lg:block" aria-label="Filters">
        <CatalogFilters query={query} facets={result.facets} idPrefix="d" />
      </aside>

      <section aria-labelledby="results-title" className="min-w-0">
        <div className="flex flex-col gap-4 border-b pb-5">
          <div>
            {context && <p className="text-sm font-medium text-spruce">{context}</p>}
            <h1 id="results-title" className="text-3xl font-semibold">
              {title}
            </h1>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="tabular text-sm text-muted-foreground" aria-live="polite">
              {result.total === 0
                ? "No products found"
                : `Showing ${firstItem}–${lastItem} of ${result.total} ${result.total === 1 ? "product" : "products"}`}
            </p>
            <div className="flex items-center gap-2">
              <MobileFilters query={query} facets={result.facets} activeCount={activeCount} total={result.total} />
              <SortSelect query={query} />
            </div>
          </div>
          <ActiveFilters query={query} />
        </div>

        <div className="pt-6">
          {result.total === 0 ? (
            <NoResults query={query} />
          ) : (
            <>
              <ProductGrid products={result.items} priorityCount={4} />
              <Pagination query={query} page={result.page} pageCount={result.pageCount} />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function NoResults({ query }: { query: CatalogQuery }) {
  const hasRefinements =
    Boolean(query.brands?.length) ||
    query.minPrice !== undefined ||
    query.maxPrice !== undefined ||
    query.inStock ||
    query.onSale;
  const hasScope = Boolean(query.department || query.category);

  return (
    <EmptyState
      icon={SearchXIcon}
      title="Nothing on this shelf"
      description={
        query.q ? (
          <p>
            No products match “{query.q}”{hasRefinements || hasScope ? " with the current filters" : ""}. Check
            the spelling or try a more general word, like “phone” or “chair”.
          </p>
        ) : (
          <p>No products match these filters. Remove a filter to see more.</p>
        )
      }
    >
      {hasRefinements && (
        <Link
          href={catalogHref({ q: query.q, department: query.department, category: query.category })}
          className={cn(buttonVariants(), "h-10 px-4")}
        >
          Clear filters
        </Link>
      )}
      {query.q && hasScope && (
        <Link href={catalogHref({ q: query.q })} className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}>
          Search all departments
        </Link>
      )}
      <Link href="/search" className={cn(buttonVariants({ variant: "outline" }), "h-10 px-4")}>
        Browse all products
      </Link>
    </EmptyState>
  );
}

function CatalogSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_1fr] lg:gap-10" aria-busy="true" aria-label="Loading products">
      <div className="hidden space-y-3 lg:block">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-4 h-5 w-48" />
        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i}>
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="mt-3 h-4 w-3/4" />
              <Skeleton className="mt-2 h-5 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
