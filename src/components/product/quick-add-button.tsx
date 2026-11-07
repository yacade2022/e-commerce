"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAddToCart } from "./use-add-to-cart";

export function QuickAddButton({ product }: { product: Product }) {
  const addToCart = useAddToCart();
  const base = "h-9 w-full text-sm";

  if (product.stock <= 0) {
    return (
      <Button variant="outline" disabled className={base}>
        Out of stock
      </Button>
    );
  }

  if (product.variants.length > 0) {
    return (
      <Link
        href={`/product/${product.slug}`}
        className={cn(buttonVariants({ variant: "outline" }), base)}
        aria-label={`Choose options for ${product.title}`}
      >
        Choose options
      </Link>
    );
  }

  return (
    <Button
      className={cn(base, "bg-sun font-semibold text-pine hover:bg-sun-strong")}
      onClick={() => addToCart(product, {}, 1)}
      aria-label={`Add ${product.title} to cart`}
    >
      Add to cart
    </Button>
  );
}
