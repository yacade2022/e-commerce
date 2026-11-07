import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { catalogHref } from "@/lib/search-params";
import type { CatalogQuery } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Page numbers with ellipses, e.g. 1 … 4 5 6 … 12 */
function pageList(current: number, count: number): (number | "gap")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const pages = new Set([1, count, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= count).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

export function Pagination({ query, page, pageCount }: { query: CatalogQuery; page: number; pageCount: number }) {
  if (pageCount <= 1) return null;
  const href = (p: number) => catalogHref({ ...query, page: p });
  const edge =
    "inline-flex h-10 items-center gap-1 rounded-lg border bg-white px-3 text-sm font-medium hover:bg-accent";
  const disabled = "pointer-events-none opacity-40";

  return (
    <nav aria-label="Pagination" className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} className={edge} rel="prev">
          <ChevronLeftIcon className="size-4" aria-hidden="true" />
          Previous
        </Link>
      ) : (
        <span className={cn(edge, disabled)} aria-hidden="true">
          <ChevronLeftIcon className="size-4" />
          Previous
        </span>
      )}
      <ul className="flex items-center gap-1">
        {pageList(page, pageCount).map((p, i) =>
          p === "gap" ? (
            <li key={`gap-${i}`} className="px-1 text-muted-foreground" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                href={href(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                className={cn(
                  "tabular inline-flex size-10 items-center justify-center rounded-lg text-sm font-medium",
                  p === page ? "bg-spruce text-white" : "hover:bg-accent",
                )}
              >
                {p}
              </Link>
            </li>
          ),
        )}
      </ul>
      {page < pageCount ? (
        <Link href={href(page + 1)} className={edge} rel="next">
          Next
          <ChevronRightIcon className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className={cn(edge, disabled)} aria-hidden="true">
          Next
          <ChevronRightIcon className="size-4" />
        </span>
      )}
    </nav>
  );
}
