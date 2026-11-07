"use client";

import { SlidersHorizontalIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { CatalogQuery, CatalogResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CatalogFilters } from "./catalog-filters";

export function MobileFilters({
  query,
  facets,
  activeCount,
  total,
}: {
  query: CatalogQuery;
  facets: CatalogResult["facets"];
  activeCount: number;
  total: number;
}) {
  return (
    <Sheet>
      <SheetTrigger className={cn(buttonVariants({ variant: "outline" }), "h-9 bg-white lg:hidden")}>
        <SlidersHorizontalIcon aria-hidden="true" />
        Filters
        {activeCount > 0 && (
          <span className="tabular ml-1 rounded-full bg-spruce px-1.5 text-xs leading-5 text-white">
            {activeCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="w-[88vw] max-w-sm gap-0">
        <SheetHeader className="border-b">
          <SheetTitle className="font-display text-lg">Filters</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <CatalogFilters query={query} facets={facets} idPrefix="m" />
        </div>
        <SheetFooter className="border-t">
          <SheetClose className={cn(buttonVariants(), "h-10 w-full text-base")}>
            Show {total} {total === 1 ? "result" : "results"}
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
