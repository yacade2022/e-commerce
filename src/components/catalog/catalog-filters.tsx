"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { catalogHref } from "@/lib/search-params";
import type { CatalogQuery, CatalogResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CatalogFiltersProps {
  query: CatalogQuery;
  facets: CatalogResult["facets"];
  idPrefix: string;
}

const pricePresets = [
  { label: "Under $25", min: undefined, max: 25 },
  { label: "$25 to $100", min: 25, max: 100 },
  { label: "$100 to $500", min: 100, max: 500 },
  { label: "$500 and up", min: 500, max: undefined },
];

const BRAND_PREVIEW = 8;

export function CatalogFilters({ query, facets, idPrefix }: CatalogFiltersProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showAllBrands, setShowAllBrands] = useState(false);

  const update = (changes: Partial<CatalogQuery>) => {
    startTransition(() => {
      router.push(catalogHref({ ...query, ...changes, page: 1 }), { scroll: false });
    });
  };

  const selectedBrands = new Set(query.brands ?? []);
  const brands = showAllBrands ? facets.brands : facets.brands.slice(0, BRAND_PREVIEW);

  return (
    <div className={cn("space-y-7 text-sm", pending && "opacity-60 transition-opacity")} aria-busy={pending}>
      {/* Department / category: navigational, so these are links. */}
      <FilterGroup title="Department">
        <ul className="space-y-1">
          <li>
            <FilterLink
              href={catalogHref({ ...query, department: undefined, category: undefined, brands: [], page: 1 })}
              active={!query.department && !query.category}
            >
              All departments
            </FilterLink>
          </li>
          {facets.departments.map((d) => (
            <li key={d.value}>
              <FilterLink
                href={catalogHref({ ...query, department: d.value as CatalogQuery["department"], category: undefined, brands: [], page: 1 })}
                active={query.department === d.value && !query.category}
                count={d.count}
              >
                {d.label}
              </FilterLink>
              {query.department === d.value && facets.categories.length > 1 && (
                <ul className="mt-1 ml-3 space-y-1 border-l pl-3">
                  {facets.categories.map((c) => (
                    <li key={c.value}>
                      <FilterLink
                        href={catalogHref({ ...query, category: c.value, brands: [], page: 1 })}
                        active={query.category === c.value}
                        count={c.count}
                      >
                        {c.label}
                      </FilterLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="Availability">
        <div className="space-y-3">
          <CheckRow
            id={`${idPrefix}-stock`}
            label="In stock only"
            checked={Boolean(query.inStock)}
            onChange={(v) => update({ inStock: v })}
          />
          <CheckRow
            id={`${idPrefix}-sale`}
            label="On sale"
            checked={Boolean(query.onSale)}
            onChange={(v) => update({ onSale: v })}
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Price">
        <ul className="space-y-1">
          {pricePresets.map((p) => (
            <li key={p.label}>
              <FilterLink
                href={catalogHref({ ...query, minPrice: p.min, maxPrice: p.max, page: 1 })}
                active={query.minPrice === p.min && query.maxPrice === p.max}
              >
                {p.label}
              </FilterLink>
            </li>
          ))}
        </ul>
        <PriceRangeForm
          key={`${query.minPrice}-${query.maxPrice}`}
          idPrefix={idPrefix}
          min={query.minPrice}
          max={query.maxPrice}
          placeholderMin={facets.priceRange.min}
          placeholderMax={facets.priceRange.max}
          onApply={(minPrice, maxPrice) => update({ minPrice, maxPrice })}
        />
      </FilterGroup>

      {facets.brands.length > 0 && (
        <FilterGroup title="Brand">
          <div className="space-y-3">
            {brands.map((b) => (
              <CheckRow
                key={b.value}
                id={`${idPrefix}-brand-${b.value.replace(/\W+/g, "-")}`}
                label={b.label}
                count={b.count}
                checked={selectedBrands.has(b.value)}
                onChange={(v) => {
                  const next = new Set(selectedBrands);
                  if (v) next.add(b.value);
                  else next.delete(b.value);
                  update({ brands: [...next] });
                }}
              />
            ))}
          </div>
          {facets.brands.length > BRAND_PREVIEW && (
            <button
              type="button"
              onClick={() => setShowAllBrands((s) => !s)}
              className="mt-3 text-sm font-medium text-spruce underline-offset-2 hover:underline"
              aria-expanded={showAllBrands}
            >
              {showAllBrands ? "Show fewer brands" : `Show all ${facets.brands.length} brands`}
            </button>
          )}
        </FilterGroup>
      )}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function FilterLink({
  href,
  active,
  count,
  children,
}: {
  href: string;
  active: boolean;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex items-center justify-between gap-2 rounded-md px-2 py-1 -mx-2 hover:bg-accent",
        active ? "font-semibold text-spruce" : "text-foreground",
      )}
    >
      <span>{children}</span>
      {count !== undefined && <span className="tabular text-xs text-muted-foreground">{count}</span>}
    </Link>
  );
}

function CheckRow({
  id,
  label,
  count,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  count?: number;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v)} />
      <Label htmlFor={id} className="flex-1 cursor-pointer font-normal">
        {label}
      </Label>
      {count !== undefined && <span className="tabular text-xs text-muted-foreground">{count}</span>}
    </div>
  );
}

function PriceRangeForm({
  idPrefix,
  min,
  max,
  placeholderMin,
  placeholderMax,
  onApply,
}: {
  idPrefix: string;
  min?: number;
  max?: number;
  placeholderMin: number;
  placeholderMax: number;
  onApply: (min?: number, max?: number) => void;
}) {
  const [lo, setLo] = useState(min?.toString() ?? "");
  const [hi, setHi] = useState(max?.toString() ?? "");
  const parse = (v: string) => (v.trim() === "" || Number.isNaN(Number(v)) ? undefined : Math.max(0, Number(v)));
  const loNum = parse(lo);
  const hiNum = parse(hi);
  const invalid = loNum !== undefined && hiNum !== undefined && loNum > hiNum;

  return (
    <form
      className="mt-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!invalid) onApply(loNum, hiNum);
      }}
    >
      <fieldset className="flex items-end gap-2">
        <legend className="sr-only">Custom price range in dollars</legend>
        <div className="flex-1">
          <Label htmlFor={`${idPrefix}-min`} className="mb-1 text-xs text-muted-foreground">
            Min
          </Label>
          <Input
            id={`${idPrefix}-min`}
            inputMode="decimal"
            type="number"
            min={0}
            value={lo}
            placeholder={`$${placeholderMin}`}
            onChange={(e) => setLo(e.target.value)}
            aria-invalid={invalid || undefined}
            className="h-9 bg-white"
          />
        </div>
        <div className="flex-1">
          <Label htmlFor={`${idPrefix}-max`} className="mb-1 text-xs text-muted-foreground">
            Max
          </Label>
          <Input
            id={`${idPrefix}-max`}
            inputMode="decimal"
            type="number"
            min={0}
            value={hi}
            placeholder={`$${placeholderMax}`}
            onChange={(e) => setHi(e.target.value)}
            aria-invalid={invalid || undefined}
            className="h-9 bg-white"
          />
        </div>
        <Button type="submit" variant="outline" className="h-9" disabled={invalid}>
          Go
        </Button>
      </fieldset>
      {invalid && (
        <p className="mt-2 text-xs text-sale" role="alert">
          Min must be lower than max.
        </p>
      )}
    </form>
  );
}
