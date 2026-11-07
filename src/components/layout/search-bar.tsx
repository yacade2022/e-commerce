"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useId, useMemo, useRef, useState } from "react";
import { SearchIcon } from "lucide-react";
import { departments } from "@/data/taxonomy";
import { cn } from "@/lib/utils";

export interface Suggestion {
  slug: string;
  title: string;
  thumbnail: string;
  categoryLabel: string;
}

interface SearchBarProps {
  suggestions: Suggestion[];
  className?: string;
}

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function SearchForm({
  suggestions,
  className,
  initialQuery = "",
  initialDept = "",
}: SearchBarProps & { initialQuery?: string; initialDept?: string }) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [dept, setDept] = useState(initialDept);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const matches = useMemo(() => {
    const terms = normalize(query).split(" ").filter(Boolean);
    if (!terms.length) return [];
    return suggestions
      .filter((s) => {
        const t = normalize(s.title);
        return terms.every((term) => t.includes(term));
      })
      .slice(0, 6);
  }, [query, suggestions]);

  const showList = open && matches.length > 0;

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (showList && active >= 0 && matches[active]) {
      goTo(`/product/${matches[active].slug}`);
      return;
    }
    const sp = new URLSearchParams();
    if (query.trim()) sp.set("q", query.trim());
    if (dept) sp.set("dept", dept);
    const s = sp.toString();
    goTo(s ? `/search?${s}` : "/search");
  }

  function goTo(href: string) {
    setOpen(false);
    setActive(-1);
    inputRef.current?.blur();
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showList) {
      if (e.key === "ArrowDown" && matches.length) setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? matches.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  return (
    <form
      role="search"
      action="/search"
      onSubmit={submit}
      className={cn("relative flex h-11 w-full rounded-lg bg-white ring-sun focus-within:ring-3", className)}
    >
      <label htmlFor={`${listId}-dept`} className="sr-only">
        Department
      </label>
      <select
        id={`${listId}-dept`}
        name="dept"
        value={dept}
        onChange={(e) => setDept(e.target.value)}
        className="hidden max-w-40 shrink-0 cursor-pointer rounded-l-lg border-r border-border bg-shelf px-3 text-sm text-foreground outline-none hover:bg-accent focus-visible:bg-accent sm:block"
      >
        <option value="">All departments</option>
        {departments.map((d) => (
          <option key={d.slug} value={d.slug}>
            {d.label}
          </option>
        ))}
      </select>
      <label htmlFor={`${listId}-q`} className="sr-only">
        Search products
      </label>
      <input
        ref={inputRef}
        id={`${listId}-q`}
        name="q"
        type="search"
        autoComplete="off"
        placeholder="Search products, brands and more"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={showList}
        aria-controls={`${listId}-list`}
        aria-autocomplete="list"
        aria-activedescendant={showList && active >= 0 ? `${listId}-opt-${active}` : undefined}
        className="min-w-0 flex-1 rounded-l-lg bg-transparent px-3 text-[0.95rem] text-foreground outline-none placeholder:text-muted-foreground sm:rounded-none [&::-webkit-search-cancel-button]:cursor-pointer"
      />
      <button
        type="submit"
        className="flex w-12 shrink-0 items-center justify-center rounded-r-lg bg-sun text-pine hover:bg-sun-strong focus-visible:outline-offset-[-3px]"
      >
        <SearchIcon className="size-5" aria-hidden="true" />
        <span className="sr-only">Search</span>
      </button>

      <ul
        id={`${listId}-list`}
        role="listbox"
        aria-label="Suggested products"
        hidden={!showList}
        className="absolute inset-x-0 top-full z-50 mt-1.5 overflow-hidden rounded-lg border bg-popover py-1 text-popover-foreground shadow-lg"
      >
        {matches.map((m, i) => (
          <li
            key={m.slug}
            id={`${listId}-opt-${i}`}
            role="option"
            aria-selected={i === active}
            // Prevent input blur before the click registers.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => goTo(`/product/${m.slug}`)}
            onMouseEnter={() => setActive(i)}
            className={cn(
              "flex cursor-pointer items-center gap-3 px-3 py-2 text-sm",
              i === active && "bg-accent",
            )}
          >
            <span className="relative size-9 shrink-0 overflow-hidden rounded bg-shelf">
              <Image src={m.thumbnail} alt="" fill sizes="36px" className="object-contain p-0.5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium">{m.title}</span>
              <span className="block text-xs text-muted-foreground">in {m.categoryLabel}</span>
            </span>
          </li>
        ))}
      </ul>
    </form>
  );
}

function SearchFromUrl(props: SearchBarProps) {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const dept = params.get("dept") ?? "";
  // Remount when the URL changes so the inputs reflect the current search.
  return <SearchForm key={`${q}|${dept}`} {...props} initialQuery={q} initialDept={dept} />;
}

export function SearchBar(props: SearchBarProps) {
  return (
    <Suspense fallback={<SearchForm {...props} />}>
      <SearchFromUrl {...props} />
    </Suspense>
  );
}
