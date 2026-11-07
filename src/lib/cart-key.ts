import type { SelectedOptions } from "@/lib/types";

/** Unique key for a product + option combination. Shared by the client cart and the server. */
export function cartItemKey(productId: string, options: SelectedOptions): string {
  const opts = Object.keys(options)
    .sort()
    .map((k) => `${k}=${options[k]}`)
    .join("&");
  return opts ? `${productId}?${opts}` : productId;
}
