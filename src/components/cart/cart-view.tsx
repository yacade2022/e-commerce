"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBagIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/empty-state";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { site } from "@/data/site";
import { cartActions, useCart, useHydrated } from "@/lib/cart-store";
import { formatPrice, pluralize } from "@/lib/format";
import type { CartItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { OrderSummary } from "./order-summary";

export function CartView() {
  const hydrated = useHydrated();
  const { items, totals } = useCart();

  if (!hydrated) return <CartSkeleton />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBagIcon}
        headingLevel="h1"
        title="Your cart is empty"
        description={<p>Items you add will be saved here on this device.</p>}
      >
        <Link href="/search" className={cn(buttonVariants(), "h-10 px-5")}>
          Start shopping
        </Link>
        <Link href="/search?sale=1&sort=savings" className={cn(buttonVariants({ variant: "outline" }), "h-10 px-5")}>
          See today’s deals
        </Link>
      </EmptyState>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl font-semibold">Your cart</h1>
        <p className="text-sm text-muted-foreground">{pluralize(totals.itemCount, "item")}</p>
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <ul className="divide-y border-y" aria-label="Cart items">
          {items.map((item) => (
            <CartLine key={item.key} item={item} />
          ))}
        </ul>
        <OrderSummary totals={totals} className="lg:sticky lg:top-6">
          <Link
            href="/checkout"
            className={cn(buttonVariants(), "h-11 w-full bg-sun text-base font-semibold text-pine hover:bg-sun-strong")}
          >
            Go to checkout
          </Link>
          <p className="text-center text-xs text-muted-foreground">Demo checkout. No payment is collected.</p>
        </OrderSummary>
      </div>
    </>
  );
}

function CartLine({ item }: { item: CartItem }) {
  const max = Math.min(item.maxQuantity, site.maxQuantityPerItem);
  const options = Object.entries(item.options);

  function remove() {
    const index = cartActions.remove(item.key);
    toast("Removed from cart", {
      description: item.title,
      action: { label: "Undo", onClick: () => cartActions.restore(item, index) },
    });
  }

  return (
    <li className="flex gap-4 py-5">
      <Link
        href={`/product/${item.slug}`}
        className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-shelf sm:size-28"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image src={item.image} alt="" fill sizes="112px" className="object-contain p-2 mix-blend-multiply" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="min-w-0">
          {item.brand && <p className="text-xs font-medium text-muted-foreground">{item.brand}</p>}
          <h2 className="font-sans text-base font-medium tracking-normal">
            <Link href={`/product/${item.slug}`} className="hover:underline">
              {item.title}
            </Link>
          </h2>
          {options.length > 0 && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {options.map(([k, v]) => `${k}: ${v}`).join(", ")}
            </p>
          )}
          <p className="tabular mt-1 text-sm text-muted-foreground">{formatPrice(item.unitPrice)} each</p>
          <div className="mt-3 flex items-center gap-3">
            <QuantityStepper
              size="sm"
              value={item.quantity}
              max={max}
              onChange={(q) => cartActions.setQuantity(item.key, q)}
              label={`Quantity for ${item.title}`}
            />
            <button
              type="button"
              onClick={remove}
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Trash2Icon className="size-4" aria-hidden="true" />
              Remove<span className="sr-only"> {item.title}</span>
            </button>
          </div>
          {item.quantity >= max && (
            <p className="mt-2 text-xs text-muted-foreground">
              {max === item.maxQuantity ? `Only ${max} in stock.` : `Limit ${max} per order.`}
            </p>
          )}
        </div>
        <p className="tabular font-display text-lg font-semibold sm:text-right">
          <span className="sr-only">Line total: </span>
          {formatPrice(item.unitPrice * item.quantity)}
        </p>
      </div>
    </li>
  );
}

function CartSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading cart">
      <Skeleton className="h-9 w-48" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="size-28 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}
