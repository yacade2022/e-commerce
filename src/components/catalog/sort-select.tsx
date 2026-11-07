"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { catalogHref, sortOptions } from "@/lib/search-params";
import type { CatalogQuery, SortOption } from "@/lib/types";

export function SortSelect({ query }: { query: CatalogQuery }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      {/* Visually hidden on the narrowest phones so Filters + Sort fit in one row; still labels the select. */}
      <span id="sort-label" className="text-sm whitespace-nowrap text-muted-foreground max-[359px]:sr-only">
        Sort by
      </span>
      <Select
        items={sortOptions}
        value={query.sort ?? "featured"}
        onValueChange={(value) => {
          if (!value) return;
          startTransition(() => {
            router.push(catalogHref({ ...query, sort: value as SortOption, page: 1 }), { scroll: false });
          });
        }}
      >
        <SelectTrigger aria-labelledby="sort-label" className="h-9 min-w-44 bg-white" aria-busy={pending}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
