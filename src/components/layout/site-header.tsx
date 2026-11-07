import Link from "next/link";
import { CircleHelpIcon } from "lucide-react";
import { departments } from "@/data/taxonomy";
import { CartLink } from "./cart-link";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { SearchBar, type Suggestion } from "./search-bar";

export function SiteHeader({ suggestions }: { suggestions: Suggestion[] }) {
  return (
    <header className="bg-spruce text-white">
      <div className="container-page flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 lg:flex-nowrap lg:gap-6 lg:py-3">
        <MobileNav />
        <Logo className="mr-auto lg:mr-0" />
        <SearchBar suggestions={suggestions} className="order-last lg:order-none lg:flex-1" />
        <nav aria-label="Account and help" className="flex items-center gap-1">
          <Link
            href="/faq"
            className="hidden h-11 items-center gap-2 rounded-lg px-2.5 text-sm font-medium hover:bg-white/10 md:inline-flex"
          >
            <CircleHelpIcon className="size-5" aria-hidden="true" />
            Help
          </Link>
          <CartLink />
        </nav>
      </div>
      <nav aria-label="Departments" className="hidden bg-pine lg:block">
        <ul className="container-page flex items-center gap-1 overflow-x-auto py-1 text-sm">
          <li>
            <Link
              href="/search?sale=1&sort=savings"
              className="inline-flex h-9 items-center rounded-md px-3 font-semibold whitespace-nowrap text-sun hover:bg-white/10"
            >
              Today’s deals
            </Link>
          </li>
          {departments.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/search?dept=${d.slug}`}
                className="inline-flex h-9 items-center gap-2 rounded-md px-3 whitespace-nowrap text-white/90 hover:bg-white/10 hover:text-white"
              >
                <span className="tabular font-display text-white/50" aria-hidden="true">
                  {d.aisle}
                </span>
                {d.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
