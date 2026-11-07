"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { site } from "@/data/site";
import { cartActions } from "@/lib/cart-store";
import { unitPriceFor } from "@/lib/pricing";
import type { Product, SelectedOptions } from "@/lib/types";

/** Adds a product to the cart and reports the outcome in a toast. */
export function useAddToCart() {
  const router = useRouter();

  return (product: Product, options: SelectedOptions, quantity: number) => {
    const optionText = Object.values(options).join(", ");
    const result = cartActions.add({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      brand: product.brand,
      image: product.thumbnail,
      unitPrice: unitPriceFor(product.price, product.variants, options),
      options,
      quantity,
      maxQuantity: product.stock,
    });
    const limit = Math.min(product.stock, site.maxQuantityPerItem);
    const viewCart = { label: "View cart", onClick: () => router.push("/cart") };

    if (result.status === "full") {
      toast.warning("Quantity limit reached", {
        description: `You already have ${result.quantity} in your cart, the most you can order.`,
        action: viewCart,
      });
    } else if (result.status === "capped") {
      toast.success("Cart updated", {
        description: `${product.title}${optionText ? ` (${optionText})` : ""}: quantity set to the limit of ${limit}.`,
        action: viewCart,
      });
    } else {
      toast.success("Added to cart", {
        description: `${quantity} × ${product.title}${optionText ? ` (${optionText})` : ""}`,
        action: viewCart,
      });
    }
  };
}
