"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { site } from "@/data/site";
import { formatPriceCompact } from "@/lib/format";
import { unitPriceFor } from "@/lib/pricing";
import type { Product, SelectedOptions } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Price } from "./price";
import { QuantityStepper } from "./quantity-stepper";
import { StockStatus } from "./stock-status";
import { useAddToCart } from "./use-add-to-cart";

export function PurchasePanel({ product }: { product: Product }) {
  const addToCart = useAddToCart();
  const [selected, setSelected] = useState<SelectedOptions>({});
  const [quantity, setQuantity] = useState(1);
  const [showErrors, setShowErrors] = useState(false);

  const missing = product.variants.filter((g) => !selected[g.name]);
  const unitPrice = unitPriceFor(product.price, product.variants, selected);
  const delta = unitPrice - product.price;
  const maxQty = Math.min(product.stock, site.maxQuantityPerItem);
  const soldOut = product.stock <= 0;

  function handleAdd() {
    if (missing.length) {
      setShowErrors(true);
      return;
    }
    addToCart(product, selected, quantity);
  }

  return (
    <div className="space-y-6">
      <div>
        <Price
          price={unitPrice}
          listPrice={product.listPrice ? product.listPrice + delta : null}
          size="lg"
        />
        <p className="mt-1 text-sm text-muted-foreground">
          {unitPrice >= site.freeShippingThreshold
            ? "Free standard shipping"
            : `Free standard shipping on orders over ${formatPriceCompact(site.freeShippingThreshold)}`}
        </p>
      </div>

      {product.variants.map((group) => {
        const groupId = `variant-${group.name.toLowerCase()}`;
        const invalid = showErrors && !selected[group.name];
        return (
          <fieldset key={group.name} aria-describedby={invalid ? `${groupId}-error` : undefined}>
            <legend className="text-sm font-semibold">
              {group.name}
              {selected[group.name] && (
                <span className="font-normal text-muted-foreground">: {selected[group.name]}</span>
              )}
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.options.map((opt) => {
                const checked = selected[group.name] === opt.label;
                return (
                  <label key={opt.label} className="relative">
                    <input
                      type="radio"
                      name={groupId}
                      value={opt.label}
                      checked={checked}
                      disabled={soldOut}
                      onChange={() => setSelected((s) => ({ ...s, [group.name]: opt.label }))}
                      className="peer sr-only"
                    />
                    <span
                      className={cn(
                        "flex min-w-14 cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium",
                        "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                        checked ? "border-spruce bg-spruce text-white" : "border-input bg-white hover:border-spruce",
                        invalid && "border-sale",
                      )}
                    >
                      {opt.label}
                      {opt.priceDelta > 0 && (
                        <span className={cn("ml-1 text-xs", checked ? "text-white/80" : "text-muted-foreground")}>
                          +{formatPriceCompact(opt.priceDelta)}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
            {invalid && (
              <p id={`${groupId}-error`} className="mt-2 text-sm text-sale" role="alert">
                Choose a {group.name.toLowerCase()} to continue.
              </p>
            )}
          </fieldset>
        );
      })}

      <div className="space-y-3 rounded-xl border p-4">
        <StockStatus stock={product.stock} />
        {!soldOut && (
          <div className="flex flex-wrap items-center gap-3">
            <QuantityStepper
              value={quantity}
              max={maxQty}
              onChange={(q) => setQuantity(Math.max(1, Math.min(q, maxQty)))}
              label="Quantity"
            />
            <Button
              onClick={handleAdd}
              className="h-10 flex-1 bg-sun px-6 text-base font-semibold text-pine hover:bg-sun-strong"
            >
              Add to cart
            </Button>
          </div>
        )}
        {!soldOut && product.stock > site.maxQuantityPerItem && (
          <p className="text-xs text-muted-foreground">Limit {maxQty} per order.</p>
        )}
      </div>
    </div>
  );
}
