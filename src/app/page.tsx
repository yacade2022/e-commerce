import Image from "next/image";
import Link from "next/link";
import { PackageCheckIcon, RotateCcwIcon, ShoppingBagIcon } from "lucide-react";
import { ProductGrid } from "@/components/product/product-card";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/data/site";
import {
  getCategory,
  getDepartmentCount,
  getDepartments,
  getDeals,
  getProductsBySlugs,
  searchProducts,
} from "@/lib/catalog";
import { formatPriceCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

const featuredCategorySlugs = [
  "smartphones",
  "laptops",
  "kitchen-accessories",
  "furniture",
  "fragrances",
  "mens-watches",
  "sunglasses",
  "sports-accessories",
];

export default async function HomePage() {
  const departments = getDepartments();
  const [deals, electronics, home] = await Promise.all([
    getDeals(8),
    searchProducts({ department: "electronics", inStock: true, pageSize: 4 }),
    searchProducts({ department: "home-kitchen", category: "furniture", pageSize: 4 }),
  ]);
  const categoryCovers = await Promise.all(
    featuredCategorySlugs.map(async (slug) => {
      const { items } = await searchProducts({ category: slug, pageSize: 1 });
      return { category: getCategory(slug)!, product: items[0] };
    }),
  );
  const heroProducts = await getProductsBySlugs(["iphone-13-pro", "annibale-colombo-sofa", "rolex-cellini-date-black-dial"]);

  return (
    <>
      {/* Hero: the store directory */}
      <section className="bg-spruce text-white" aria-labelledby="hero-title">
        <div className="container-page grid gap-10 pt-10 pb-14 lg:grid-cols-[1fr_minmax(0,30rem)] lg:items-center lg:gap-16 lg:pt-14 lg:pb-20">
          <div>
            <h1 id="hero-title" className="max-w-xl text-4xl leading-[1.05] font-semibold sm:text-5xl lg:text-6xl">
              The whole store, sorted into seven aisles.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/80">
              Search the shelves for phones, furniture, groceries and more. Standard shipping is free on
              orders over {formatPriceCompact(site.freeShippingThreshold)}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/search?sale=1&sort=savings"
                className={cn(buttonVariants(), "h-11 bg-sun px-5 text-base font-semibold text-pine hover:bg-sun-strong")}
              >
                Shop today’s deals
              </Link>
              <Link
                href="/search"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-11 border-white/30 bg-transparent px-5 text-base text-white hover:bg-white/10 hover:text-white",
                )}
              >
                Browse all products
              </Link>
            </div>
            <ul className="mt-10 hidden gap-3 sm:flex" aria-hidden="true">
              {heroProducts.map((p) => (
                <li key={p.id} className="relative size-24 overflow-hidden rounded-xl bg-white/95 lg:size-28">
                  <Image src={p.thumbnail} alt="" fill sizes="112px" className="object-contain p-2 mix-blend-multiply" preload />
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Store directory" className="rounded-2xl bg-pine p-2 sm:p-3">
            <p className="px-3 pt-2 pb-3 text-sm text-white/60">Store directory</p>
            <ol>
              {departments.map((d, i) => (
                <li key={d.slug} className="aisle-in" style={{ animationDelay: `${120 + i * 60}ms` }}>
                  <Link
                    href={`/search?dept=${d.slug}`}
                    className="group flex items-baseline gap-4 rounded-lg px-3 py-2 hover:bg-white/8"
                  >
                    <span className="tabular w-8 font-display text-4xl leading-none font-bold text-sun sm:text-5xl">
                      {d.aisle}
                    </span>
                    <span className="flex-1 border-b border-dashed border-white/15 pb-1 font-display text-xl font-medium group-hover:border-white/40">
                      {d.label}
                    </span>
                    <span className="tabular text-sm text-white/60">{getDepartmentCount(d.slug)} items</span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      {/* Deals */}
      <section className="container-page py-14" aria-labelledby="deals-title">
        <SectionHeading id="deals-title" title="Biggest markdowns right now" href="/search?sale=1&sort=savings" linkLabel="See all deals" />
        <ProductGrid products={deals} priorityCount={4} />
      </section>

      {/* Featured categories */}
      <section className="bg-shelf py-14" aria-labelledby="categories-title">
        <div className="container-page">
          <SectionHeading id="categories-title" title="Shop by category" href="/search" linkLabel="All products" />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {categoryCovers.map(({ category, product }) => (
              <li key={category.slug}>
                <Link
                  href={`/search?dept=${category.department}&category=${category.slug}`}
                  className="group flex h-full flex-col rounded-xl bg-white p-4 ring-1 ring-border hover:ring-spruce"
                >
                  <span className="relative block aspect-[4/3]">
                    {product && (
                      <Image
                        src={product.thumbnail}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 22vw, 45vw"
                        className="object-contain"
                      />
                    )}
                  </span>
                  <span className="mt-3 font-display text-lg font-semibold group-hover:underline">
                    {category.label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Aisle {departments.find((d) => d.slug === category.department)?.aisle}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Aisle shelves */}
      <section className="container-page py-14" aria-labelledby="electronics-title">
        <SectionHeading
          id="electronics-title"
          aisle={1}
          title="Electronics in stock"
          href="/search?dept=electronics"
          linkLabel="Shop electronics"
        />
        <ProductGrid products={electronics.items} />
      </section>

      <section className="container-page pb-14" aria-labelledby="furniture-title">
        <SectionHeading
          id="furniture-title"
          aisle={2}
          title="Furniture for every room"
          href="/search?dept=home-kitchen&category=furniture"
          linkLabel="Shop furniture"
        />
        <ProductGrid products={home.items} />
      </section>

      {/* How the store works */}
      <section className="border-t" aria-labelledby="service-title">
        <div className="container-page py-12">
          <h2 id="service-title" className="sr-only">
            How ordering works
          </h2>
          <ul className="grid gap-8 sm:grid-cols-3">
            <ServiceItem icon={PackageCheckIcon} title="Free standard shipping">
              On orders over {formatPriceCompact(site.freeShippingThreshold)}. Each product lists its own delivery
              estimate.
            </ServiceItem>
            <ServiceItem icon={RotateCcwIcon} title="Returns listed up front">
              Every product page shows its return window and warranty before you add it to your cart.
            </ServiceItem>
            <ServiceItem icon={ShoppingBagIcon} title="Your cart stays put">
              Items stay in your cart on this device, even after you close the tab.
            </ServiceItem>
          </ul>
        </div>
      </section>
    </>
  );
}

function SectionHeading({
  id,
  title,
  href,
  linkLabel,
  aisle,
}: {
  id: string;
  title: string;
  href: string;
  linkLabel: string;
  aisle?: number;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <h2 id={id} className="flex items-baseline gap-3 text-2xl font-semibold sm:text-3xl">
        {aisle !== undefined && (
          <span className="tabular font-bold text-spruce/40" aria-label={`Aisle ${aisle}:`}>
            {aisle}
          </span>
        )}
        {title}
      </h2>
      <Link href={href} className="text-sm font-semibold text-spruce underline-offset-4 hover:underline">
        {linkLabel}
      </Link>
    </div>
  );
}

function ServiceItem({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof PackageCheckIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <Icon className="mt-0.5 size-6 shrink-0 text-spruce" aria-hidden="true" />
      <div>
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</p>
      </div>
    </li>
  );
}
