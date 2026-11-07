import { site } from "@/data/site";
import type { CartItem, SelectedOptions, VariantGroup } from "@/lib/types";

export type ShippingMethod = "standard" | "express";

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  shipping: number;
  estimatedTax: number;
  total: number;
  /** Amount still needed to reach free standard shipping (0 if reached). */
  freeShippingRemaining: number;
}

/** Round to cents to avoid floating-point drift in displayed totals. */
const cents = (n: number) => Math.round(n * 100) / 100;

export function unitPriceFor(basePrice: number, variants: VariantGroup[], selected: SelectedOptions) {
  const delta = variants.reduce((sum, group) => {
    const option = group.options.find((o) => o.label === selected[group.name]);
    return sum + (option?.priceDelta ?? 0);
  }, 0);
  return cents(basePrice + delta);
}

export function shippingCost(subtotal: number, method: ShippingMethod): number {
  if (subtotal === 0) return 0;
  if (method === "express") return site.expressShipping;
  return subtotal >= site.freeShippingThreshold ? 0 : site.standardShipping;
}

export function calculateTotals(items: CartItem[], method: ShippingMethod = "standard"): CartTotals {
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = cents(items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0));
  const shipping = shippingCost(subtotal, method);
  const estimatedTax = cents(subtotal * site.estimatedTaxRate);
  return {
    itemCount,
    subtotal,
    shipping,
    estimatedTax,
    total: cents(subtotal + shipping + estimatedTax),
    freeShippingRemaining: cents(Math.max(0, site.freeShippingThreshold - subtotal)),
  };
}
