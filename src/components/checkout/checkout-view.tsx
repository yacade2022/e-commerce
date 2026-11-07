"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { CircleCheckIcon, InfoIcon, ShoppingBagIcon } from "lucide-react";
import { placeOrder, type PlacedOrder as ServerOrder } from "@/app/checkout/actions";
import { OrderSummary } from "@/components/cart/order-summary";
import { EmptyState } from "@/components/common/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { site } from "@/data/site";
import { cartActions, useCartItems, useHydrated } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { calculateTotals, shippingCost, type ShippingMethod } from "@/lib/pricing";
import type { CartItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type FieldName = "email" | "fullName" | "address1" | "address2" | "city" | "state" | "zip";
type FormValues = Record<FieldName, string>;
type FormErrors = Partial<Record<FieldName, string>>;

const initialValues: FormValues = {
  email: "",
  fullName: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
};

const fieldOrder: FieldName[] = ["email", "fullName", "address1", "address2", "city", "state", "zip"];

function validate(v: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!v.email.trim()) errors.email = "Enter an email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) errors.email = "Enter an email address like name@example.com.";
  if (!v.fullName.trim()) errors.fullName = "Enter the recipient’s full name.";
  if (!v.address1.trim()) errors.address1 = "Enter a street address.";
  if (!v.city.trim()) errors.city = "Enter a city.";
  if (!v.state.trim()) errors.state = "Enter a state.";
  if (!v.zip.trim()) errors.zip = "Enter a ZIP code.";
  else if (!/^\d{5}(-\d{4})?$/.test(v.zip.trim())) errors.zip = "Enter a 5-digit ZIP code.";
  return errors;
}

/** The server-priced order, plus the email that stays in the browser. */
type PlacedOrder = ServerOrder & { email: string };

export function CheckoutView() {
  const hydrated = useHydrated();
  const items = useCartItems();
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  if (placed) return <Confirmation order={placed} />;
  if (!hydrated) return <Skeleton className="h-[32rem] rounded-xl" aria-label="Loading checkout" />;
  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBagIcon}
        headingLevel="h1"
        title="Your cart is empty"
        description={<p>Add items to your cart before checking out.</p>}
      >
        <Link href="/search" className={cn(buttonVariants(), "h-10 px-5")}>
          Start shopping
        </Link>
      </EmptyState>
    );
  }
  return <CheckoutForm items={items} onPlaced={setPlaced} />;
}

function CheckoutForm({ items, onPlaced }: { items: CartItem[]; onPlaced: (o: PlacedOrder) => void }) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [method, setMethod] = useState<ShippingMethod>("standard");
  const [orderError, setOrderError] = useState<{ message: string; problemKeys: string[] } | null>(null);
  const [pending, startTransition] = useTransition();
  const refs = useRef<Partial<Record<FieldName, HTMLInputElement | null>>>({});
  // Display-only estimate from the browser cart; the server reprices on submit.
  const totals = calculateTotals(items, method);

  const set = (name: FieldName) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [name]: e.target.value };
    setValues(next);
    // After the first submit, re-validate as the person types.
    if (submitted) setErrors(validate(next));
  };

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const found = validate(values);
    setErrors(found);
    const first = fieldOrder.find((f) => found[f]);
    if (first) {
      refs.current[first]?.focus();
      return;
    }
    if (pending) return;
    setOrderError(null);
    // Send identifiers and quantities only; prices come from the server's catalog.
    const lines = items.map(({ productId, options, quantity }) => ({ productId, options, quantity }));
    const email = values.email.trim();
    startTransition(async () => {
      try {
        const result = await placeOrder(lines, method);
        if (!result.ok) {
          setOrderError({ message: result.error, problemKeys: result.problemKeys });
          return;
        }
        cartActions.clear();
        onPlaced({ ...result.order, email });
        window.scrollTo({ top: 0 });
      } catch {
        setOrderError({ message: "We couldn’t reach the store. Check your connection and try again.", problemKeys: [] });
      }
    });
  }

  const field = (
    name: FieldName,
    label: string,
    { className, ...props }: React.ComponentProps<"input"> = {},
  ) => (
    <div className={className}>
      <Label htmlFor={name} className="mb-1.5">
        {label}
        {name === "address2" && <span className="font-normal text-muted-foreground"> (optional)</span>}
      </Label>
      <Input
        ref={(el) => {
          refs.current[name] = el;
        }}
        id={name}
        name={name}
        value={values[name]}
        onChange={set(name)}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        className="h-10 bg-white"
        {...props}
      />
      {errors[name] && (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-sale">
          {errors[name]}
        </p>
      )}
    </div>
  );

  const errorCount = Object.keys(errors).length;

  return (
    <>
      <h1 className="text-3xl font-semibold">Checkout</h1>
      <div className="mt-4 flex gap-3 rounded-xl border border-sun bg-sun/15 p-4 text-sm" role="note">
        <InfoIcon className="size-5 shrink-0 text-pine" aria-hidden="true" />
        <p>
          <strong>This is a demo checkout.</strong> It does not collect payment details, nothing is charged and no
          order is shipped. Please don’t enter real personal information.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <form noValidate onSubmit={onSubmit} className="space-y-10" aria-label="Checkout">
          {submitted && errorCount > 0 && (
            <p role="alert" className="rounded-lg border border-sale/40 bg-sale/5 p-3 text-sm text-sale">
              Fix {errorCount === 1 ? "1 field" : `${errorCount} fields`} below to place your demo order.
            </p>
          )}

          <Step n={1} title="Contact">
            {field("email", "Email", { type: "email", autoComplete: "email" })}
            <p className="text-xs text-muted-foreground">Used only on this page. Nothing is sent.</p>
          </Step>

          <Step n={2} title="Shipping address">
            <div className="grid gap-4 sm:grid-cols-6">
              {field("fullName", "Full name", { autoComplete: "name", className: "sm:col-span-6" })}
              {field("address1", "Street address", { autoComplete: "address-line1", className: "sm:col-span-6" })}
              {field("address2", "Apartment, suite, etc.", { autoComplete: "address-line2", className: "sm:col-span-6" })}
              {field("city", "City", { autoComplete: "address-level2", className: "sm:col-span-3" })}
              {field("state", "State", { autoComplete: "address-level1", className: "sm:col-span-1" })}
              {field("zip", "ZIP code", { autoComplete: "postal-code", inputMode: "numeric", className: "sm:col-span-2" })}
            </div>
            <p className="text-xs text-muted-foreground">This demo ships to United States addresses only.</p>
          </Step>

          <Step n={3} title="Delivery">
            <fieldset>
              <legend className="sr-only">Delivery method</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <DeliveryOption
                  value="standard"
                  checked={method === "standard"}
                  onChange={setMethod}
                  title="Standard"
                  detail="Ships on each item’s listed estimate"
                  price={shippingCost(totals.subtotal, "standard")}
                />
                <DeliveryOption
                  value="express"
                  checked={method === "express"}
                  onChange={setMethod}
                  title="Express"
                  detail="Prioritized handling"
                  price={site.expressShipping}
                />
              </div>
            </fieldset>
          </Step>

          <Step n={4} title="Payment">
            <p className="rounded-lg bg-shelf p-4 text-sm text-muted-foreground">
              Payment isn’t collected in this demo. A real store would connect a payment provider here.
            </p>
          </Step>

          {orderError && (
            <div role="alert" className="rounded-lg border border-sale/40 bg-sale/5 p-3 text-sm text-sale">
              <p>{orderError.message}</p>
              {orderError.problemKeys.length > 0 && (
                <Link href="/cart" className="mt-1 inline-block font-medium underline">
                  Review your cart
                </Link>
              )}
            </div>
          )}

          <Button
            type="submit"
            disabled={pending}
            aria-busy={pending || undefined}
            className="h-12 w-full bg-sun text-base font-semibold text-pine hover:bg-sun-strong sm:w-auto sm:px-8"
          >
            {pending ? "Placing order…" : "Place demo order"}
          </Button>
        </form>

        <div className="space-y-4 lg:sticky lg:top-6">
          <OrderSummary
            totals={totals}
            shippingLabel={method === "express" ? "Express shipping" : "Standard shipping"}
          />
          <ItemList items={items} />
          <Link href="/cart" className="block py-2 text-center text-sm font-medium text-spruce hover:underline">
            Edit cart
          </Link>
        </div>
      </div>
    </>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`step-${n}`} className="space-y-4">
      <h2 id={`step-${n}`} className="flex items-center gap-3 text-xl font-semibold">
        <span
          className="tabular flex size-8 items-center justify-center rounded-full bg-spruce font-display text-base text-white"
          aria-hidden="true"
        >
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function DeliveryOption({
  value,
  checked,
  onChange,
  title,
  detail,
  price,
}: {
  value: ShippingMethod;
  checked: boolean;
  onChange: (v: ShippingMethod) => void;
  title: string;
  detail: string;
  price: number;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-4 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
        checked ? "border-spruce ring-1 ring-spruce" : "hover:border-spruce/50",
      )}
    >
      <input
        type="radio"
        name="delivery"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="mt-1 size-4 accent-[var(--spruce)]"
      />
      <span className="flex-1">
        <span className="flex justify-between gap-2 font-medium">
          {title}
          <span className="tabular">{price === 0 ? "Free" : formatPrice(price)}</span>
        </span>
        <span className="mt-0.5 block text-sm text-muted-foreground">{detail}</span>
      </span>
    </label>
  );
}

function ItemList({ items }: { items: CartItem[] }) {
  return (
    <section aria-label="Items in this order" className="rounded-xl border bg-white p-5">
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.key} className="flex gap-3 text-sm">
            <span className="relative size-14 shrink-0 overflow-hidden rounded-md bg-shelf">
              <Image src={item.image} alt="" fill sizes="56px" className="object-contain p-1 mix-blend-multiply" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 font-medium">{item.title}</span>
              <span className="text-muted-foreground">
                Qty {item.quantity}
                {Object.values(item.options).length > 0 && `, ${Object.values(item.options).join(", ")}`}
              </span>
            </span>
            <span className="tabular font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Confirmation({ order }: { order: PlacedOrder }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-mint text-spruce">
          <CircleCheckIcon className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-3xl font-semibold">Demo order placed</h1>
        <p className="mt-2 text-muted-foreground">
          Order <strong className="tabular text-foreground">{order.number}</strong> was created for this demo only.
          Nothing was charged, no email was sent to {order.email}, and nothing will ship.
        </p>
      </div>
      <div className="mt-8 space-y-4">
        <ItemList items={order.items} />
        <OrderSummary
          totals={order.totals}
          shippingLabel={order.method === "express" ? "Express shipping" : "Standard shipping"}
        />
      </div>
      <div className="mt-8 flex justify-center">
        <Link href="/search" className={cn(buttonVariants(), "h-11 px-6 text-base")}>
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
