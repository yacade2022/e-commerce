import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RotateCcwIcon, ShieldCheckIcon, TruckIcon } from "lucide-react";
import { ProductGrid } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { PurchasePanel } from "@/components/product/purchase-panel";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getAllProductSlugs, getDepartment, getProductBySlug, getRelatedProducts } from "@/lib/catalog";

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.title,
    description: product.description,
    openGraph: { images: [product.thumbnail] },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const department = getDepartment(product.department)!;
  const related = await getRelatedProducts(product, 4);

  return (
    <div className="container-page py-6 lg:py-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={`/search?dept=${department.slug}`} />}>
              {department.label}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={`/search?dept=${department.slug}&category=${product.category}`} />}>
              {product.categoryLabel}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem className="hidden sm:inline-flex">
            <BreadcrumbPage className="line-clamp-1">{product.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
        <ProductGallery images={product.images} title={product.title} />

        <div>
          {product.brand && (
            <Link
              href={`/search?brand=${encodeURIComponent(product.brand)}`}
              className="inline-flex min-h-6 items-center text-sm font-semibold text-spruce hover:underline"
            >
              {product.brand}
            </Link>
          )}
          <h1 className="mt-1 text-3xl leading-tight font-semibold sm:text-4xl">{product.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Aisle {department.aisle}, {product.categoryLabel}
          </p>
          <p className="mt-5 max-w-prose leading-relaxed text-foreground/85">{product.description}</p>

          <div className="mt-8">
            <PurchasePanel product={product} />
          </div>

          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex gap-3">
              <TruckIcon className="size-5 shrink-0 text-spruce" aria-hidden="true" />
              <span>{product.shipping}</span>
            </li>
            <li className="flex gap-3">
              <RotateCcwIcon className="size-5 shrink-0 text-spruce" aria-hidden="true" />
              <span>{product.returnPolicy}</span>
            </li>
            <li className="flex gap-3">
              <ShieldCheckIcon className="size-5 shrink-0 text-spruce" aria-hidden="true" />
              <span>{product.warranty}</span>
            </li>
          </ul>
        </div>
      </div>

      <section className="mt-14 grid gap-10 border-t pt-10 md:grid-cols-2" aria-label="Product information">
        <div>
          <h2 className="text-xl font-semibold">Product details</h2>
          <dl className="mt-4 divide-y rounded-xl border text-sm">
            <DetailRow term="Brand" value={product.brand ?? "Unbranded"} />
            <DetailRow term="Category" value={product.categoryLabel} />
            <DetailRow term="SKU" value={product.sku} />
            {product.variants.map((g) => (
              <DetailRow key={g.name} term={`${g.name} options`} value={g.options.map((o) => o.label).join(", ")} />
            ))}
            {product.tags.length > 0 && <DetailRow term="Tags" value={product.tags.join(", ")} />}
          </dl>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Shipping & returns</h2>
          <dl className="mt-4 divide-y rounded-xl border text-sm">
            <DetailRow term="Shipping" value={product.shipping} />
            <DetailRow term="Returns" value={product.returnPolicy} />
            <DetailRow term="Warranty" value={product.warranty} />
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Demo store: shipping, return and warranty terms come from the sample dataset.
          </p>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-14 border-t pt-10" aria-labelledby="related-title">
          <h2 id="related-title" className="mb-6 text-2xl font-semibold">
            More from aisle {department.aisle}: {department.label}
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}

function DetailRow({ term, value }: { term: string; value: string }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-4 px-4 py-3">
      <dt className="text-muted-foreground">{term}</dt>
      <dd>{value}</dd>
    </div>
  );
}
