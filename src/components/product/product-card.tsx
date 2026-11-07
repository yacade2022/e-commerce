import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Price } from "./price";
import { QuickAddButton } from "./quick-add-button";
import { LOW_STOCK } from "./stock-status";

interface ProductCardProps {
  product: Product;
  /** Set on above-the-fold cards to load the image eagerly. */
  priority?: boolean;
  className?: string;
}

export function ProductCard({ product, priority = false, className }: ProductCardProps) {
  const href = `/product/${product.slug}`;
  return (
    <article className={cn("group flex flex-col", className)}>
      <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-square overflow-hidden rounded-lg bg-shelf">
        <Image
          src={product.thumbnail}
          alt=""
          fill
          sizes="(min-width: 1280px) 18vw, (min-width: 768px) 30vw, 50vw"
          className={cn("object-contain p-4 mix-blend-multiply", product.stock <= 0 && "opacity-50")}
          loading={priority ? "eager" : "lazy"}
        />
      </Link>
      <div className="flex flex-1 flex-col pt-3">
        <p className="min-h-4 text-xs font-medium text-muted-foreground">{product.brand}</p>
        <h3 className="mt-0.5 font-sans text-[0.95rem] leading-snug font-medium tracking-normal">
          <Link href={href} className="line-clamp-2 rounded-sm hover:underline">
            {product.title}
          </Link>
        </h3>
        <Price price={product.price} listPrice={product.listPrice} className="mt-2" />
        <p className="mt-1 min-h-5 text-xs text-muted-foreground">
          {product.stock > 0 && product.stock < LOW_STOCK ? (
            <span className="font-medium text-sale">Only {product.stock} left</span>
          ) : product.stock > 0 ? (
            product.shipping
          ) : null}
        </p>
        <div className="mt-auto pt-3">
          <QuickAddButton product={product} />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, priorityCount = 0 }: { products: Product[]; priorityCount?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.id} className="flex">
          <ProductCard product={p} priority={i < priorityCount} className="w-full" />
        </li>
      ))}
    </ul>
  );
}
