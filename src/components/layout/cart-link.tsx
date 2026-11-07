"use client";

import Link from "next/link";
import { ShoppingBagIcon } from "lucide-react";
import { useCart, useHydrated } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

export function CartLink({ className }: { className?: string }) {
  const { totals } = useCart();
  const hydrated = useHydrated();
  const count = hydrated ? totals.itemCount : 0;
  const label = count === 1 ? "Cart, 1 item" : `Cart, ${count} items`;

  return (
    <Link
      href="/cart"
      aria-label={label}
      className={cn(
        "relative inline-flex h-11 items-center gap-2 rounded-lg px-2.5 text-white hover:bg-white/10",
        className,
      )}
    >
      <ShoppingBagIcon className="size-6" aria-hidden="true" />
      <span className="hidden text-sm font-medium md:inline">Cart</span>
      {count > 0 && (
        <span
          aria-hidden="true"
          className="tabular absolute top-0.5 left-6 min-w-5 rounded-full bg-sun px-1.5 text-center text-xs leading-5 font-semibold text-pine"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
