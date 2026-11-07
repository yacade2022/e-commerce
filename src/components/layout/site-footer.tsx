import Link from "next/link";
import { departments } from "@/data/taxonomy";
import { site } from "@/data/site";
import { Logo } from "./logo";

const help = [
  { href: "/faq", label: "FAQ" },
  { href: "/faq#shipping", label: "Shipping" },
  { href: "/faq#returns", label: "Returns & warranty" },
  { href: "/contact", label: "Contact us" },
];

const shop = [
  { href: "/search", label: "All products" },
  { href: "/search?sale=1&sort=savings", label: "Deals" },
  { href: "/cart", label: "Your cart" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-pine text-white/80">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed">{site.tagline}</p>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            This is a demo storefront. Products, prices and stock levels are sample data and no
            orders are placed.
          </p>
        </div>
        <FooterColumn title="Aisles" links={departments.map((d) => ({ href: `/search?dept=${d.slug}`, label: d.label }))} />
        <FooterColumn title="Shop" links={shop} />
        <FooterColumn title="Help" links={help} />
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-white/60 sm:flex-row sm:justify-between">
          <p>© 2026 Stockroom demo. Built with Next.js.</p>
          <p>
            Product data and photos from the{" "}
            <a href="https://dummyjson.com" className="underline underline-offset-2 hover:text-white">
              DummyJSON
            </a>{" "}
            sample dataset.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="font-display text-base font-semibold text-white">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="hover:text-white hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
