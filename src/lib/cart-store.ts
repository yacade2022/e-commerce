"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { site } from "@/data/site";
import { calculateTotals } from "@/lib/pricing";
import type { CartItem, SelectedOptions } from "@/lib/types";

const STORAGE_KEY = "stockroom.cart.v1";
const EMPTY: CartItem[] = [];

let items: CartItem[] | null = null;
const listeners = new Set<() => void>();

export function cartItemKey(productId: string, options: SelectedOptions): string {
  const opts = Object.keys(options)
    .sort()
    .map((k) => `${k}=${options[k]}`)
    .join("&");
  return opts ? `${productId}?${opts}` : productId;
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.key === "string" &&
    typeof v.productId === "string" &&
    typeof v.slug === "string" &&
    typeof v.title === "string" &&
    typeof v.image === "string" &&
    typeof v.unitPrice === "number" &&
    typeof v.quantity === "number" &&
    typeof v.maxQuantity === "number" &&
    typeof v.options === "object" &&
    v.options !== null
  );
}

function read(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter(isCartItem).map((i) => ({
      ...i,
      quantity: clamp(i.quantity, i.maxQuantity),
    }));
  } catch {
    // Storage blocked or corrupted: start with an empty cart.
    return EMPTY;
  }
}

function write(next: CartItem[]) {
  items = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked; the cart still works for this session.
  }
  listeners.forEach((l) => l());
}

function clamp(quantity: number, max: number): number {
  const limit = Math.min(max, site.maxQuantityPerItem);
  return Math.max(1, Math.min(Math.floor(quantity), limit));
}

function getSnapshot(): CartItem[] {
  if (items === null) items = read();
  return items;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      items = read();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export type AddResult = { status: "added" | "capped" | "full"; quantity: number };

export const cartActions = {
  add(item: Omit<CartItem, "key">): AddResult {
    const current = getSnapshot();
    const key = cartItemKey(item.productId, item.options);
    const existing = current.find((i) => i.key === key);
    const limit = Math.min(item.maxQuantity, site.maxQuantityPerItem);
    const wanted = (existing?.quantity ?? 0) + item.quantity;
    if (existing && existing.quantity >= limit) return { status: "full", quantity: existing.quantity };
    const quantity = Math.min(wanted, limit);
    const next = existing
      ? current.map((i) => (i.key === key ? { ...i, ...item, key, quantity } : i))
      : [...current, { ...item, key, quantity }];
    write(next);
    return { status: quantity < wanted ? "capped" : "added", quantity };
  },
  setQuantity(key: string, quantity: number) {
    write(getSnapshot().map((i) => (i.key === key ? { ...i, quantity: clamp(quantity, i.maxQuantity) } : i)));
  },
  /** Removes an item and returns its former position, for undo. */
  remove(key: string): number {
    const current = getSnapshot();
    const index = current.findIndex((i) => i.key === key);
    write(current.filter((i) => i.key !== key));
    return index;
  },
  /** Puts a removed item back at its previous position. */
  restore(item: CartItem, index: number) {
    const current = getSnapshot().filter((i) => i.key !== item.key);
    const next = [...current];
    next.splice(Math.max(0, Math.min(index, next.length)), 0, item);
    write(next);
  },
  clear() {
    write(EMPTY);
  },
};

export function useCartItems(): CartItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useCart() {
  const cartItems = useCartItems();
  const totals = useMemo(() => calculateTotals(cartItems), [cartItems]);
  const quantityOf = useCallback(
    (key: string) => cartItems.find((i) => i.key === key)?.quantity ?? 0,
    [cartItems],
  );
  return { items: cartItems, totals, quantityOf, ...cartActions };
}

const noopSubscribe = () => () => {};

/** False during server render and hydration, true once client state is readable. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
