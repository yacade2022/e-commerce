"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { site } from "@/data/site";
import { cartItemKey } from "@/lib/cart-key";
import { getProductById } from "@/lib/catalog";
import { calculateTotals, unitPriceFor, type CartTotals, type ShippingMethod } from "@/lib/pricing";
import { checkOrderRateLimit, clientIp } from "@/lib/rate-limit";
import type { CartItem, Product, SelectedOptions } from "@/lib/types";

/** What the client sends: identifiers and quantities only, never prices. */
export interface OrderLineInput {
  productId: string;
  options: SelectedOptions;
  quantity: number;
}

export interface PlacedOrder {
  number: string;
  items: CartItem[];
  totals: CartTotals;
  method: ShippingMethod;
}

export type PlaceOrderResult =
  | { ok: true; order: PlacedOrder }
  | { ok: false; error: string; problemKeys: string[] };

const MAX_LINES = 50;

/**
 * Prices a demo order on the server from the catalog. Server Functions can be
 * called with a direct POST, so every argument is treated as untrusted input.
 */
export async function placeOrder(lines: unknown, method: unknown): Promise<PlaceOrderResult> {
  // 10 attempts per client IP per 10 minutes, checked first so probing with
  // invalid input also uses up attempts. Shared across instances via Upstash.
  const { limited, retryAfter } = await checkOrderRateLimit(clientIp(await headers()));
  if (limited) {
    const minutes = Math.ceil(retryAfter / 60);
    return {
      ok: false,
      error: `Too many order attempts. Try again in ${minutes === 1 ? "1 minute" : `${minutes} minutes`}.`,
      problemKeys: [],
    };
  }

  if (method !== "standard" && method !== "express") {
    return { ok: false, error: "Choose a delivery method.", problemKeys: [] };
  }
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > MAX_LINES) {
    return { ok: false, error: "Your cart couldn’t be read. Refresh the page and try again.", problemKeys: [] };
  }

  const items: CartItem[] = [];
  const problemKeys: string[] = [];
  const seen = new Set<string>();

  for (const raw of lines) {
    const line = parseLine(raw);
    if (!line) {
      return { ok: false, error: "Your cart couldn’t be read. Refresh the page and try again.", problemKeys: [] };
    }
    const key = cartItemKey(line.productId, line.options);
    const product = await getProductById(line.productId);
    if (seen.has(key) || !product || !validOptions(product, line.options) || !validQuantity(product, line.quantity)) {
      problemKeys.push(key);
      continue;
    }
    seen.add(key);
    items.push({
      key,
      productId: product.id,
      slug: product.slug,
      title: product.title,
      brand: product.brand,
      image: product.thumbnail,
      options: line.options,
      quantity: line.quantity,
      maxQuantity: product.stock,
      // Authoritative price from the catalog; the client's price is never used.
      unitPrice: unitPriceFor(product.price, product.variants, line.options),
    });
  }

  if (problemKeys.length > 0) {
    return {
      ok: false,
      error:
        problemKeys.length === 1
          ? "One item in your cart is no longer available in that quantity or option. Update it and try again."
          : `${problemKeys.length} items in your cart are no longer available in those quantities or options. Update them and try again.`,
      problemKeys,
    };
  }

  return {
    ok: true,
    order: {
      number: `DEMO-${randomUUID().slice(0, 8).toUpperCase()}`,
      items,
      totals: calculateTotals(items, method),
      method,
    },
  };
}

function parseLine(raw: unknown): OrderLineInput | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.productId !== "string" || r.productId.length === 0 || r.productId.length > 32) return null;
  if (typeof r.quantity !== "number") return null;
  if (!r.options || typeof r.options !== "object" || Array.isArray(r.options)) return null;
  const entries = Object.entries(r.options as Record<string, unknown>);
  if (entries.length > 10 || !entries.every(([, v]) => typeof v === "string")) return null;
  return {
    productId: r.productId,
    quantity: r.quantity,
    options: Object.fromEntries(entries) as SelectedOptions,
  };
}

/** Every variant group must be chosen with a real option, and nothing extra. */
function validOptions(product: Product, options: SelectedOptions): boolean {
  const names = Object.keys(options);
  if (names.length !== product.variants.length) return false;
  return product.variants.every((group) => group.options.some((o) => o.label === options[group.name]));
}

function validQuantity(product: Product, quantity: number): boolean {
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= Math.min(product.stock, site.maxQuantityPerItem);
}
