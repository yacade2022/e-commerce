import { site } from "@/data/site";
import { formatPrice, pluralize } from "@/lib/format";
import type { CartTotals } from "@/lib/pricing";
import { cn } from "@/lib/utils";

interface OrderSummaryProps {
  totals: CartTotals;
  shippingLabel?: string;
  children?: React.ReactNode;
  className?: string;
}

export function OrderSummary({ totals, shippingLabel = "Standard shipping", children, className }: OrderSummaryProps) {
  const progress = Math.min(100, (totals.subtotal / site.freeShippingThreshold) * 100);
  return (
    <section aria-labelledby="summary-title" className={cn("rounded-xl border bg-white p-5", className)}>
      <h2 id="summary-title" className="text-xl font-semibold">
        Order summary
      </h2>

      {totals.freeShippingRemaining > 0 ? (
        <div className="mt-4 rounded-lg bg-shelf p-3 text-sm">
          <p>
            Add <strong className="tabular">{formatPrice(totals.freeShippingRemaining)}</strong> more for free
            standard shipping.
          </p>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-border"
            role="progressbar"
            aria-label="Progress toward free shipping"
            aria-valuemin={0}
            aria-valuemax={site.freeShippingThreshold}
            aria-valuenow={totals.subtotal}
          >
            <div className="h-full rounded-full bg-spruce" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : (
        <p className="mt-4 rounded-lg bg-mint p-3 text-sm text-pine">Your order qualifies for free standard shipping.</p>
      )}

      <dl className="tabular mt-5 space-y-2.5 text-sm">
        <Row term={`Subtotal (${pluralize(totals.itemCount, "item")})`} value={formatPrice(totals.subtotal)} />
        <Row term={shippingLabel} value={totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)} />
        <Row
          term={`Estimated tax (${Math.round(site.estimatedTaxRate * 100)}%)`}
          value={formatPrice(totals.estimatedTax)}
        />
        <div className="flex items-baseline justify-between border-t pt-3 text-base font-semibold">
          <dt>Estimated total</dt>
          <dd className="font-display text-2xl">{formatPrice(totals.total)}</dd>
        </div>
      </dl>
      {children && <div className="mt-5 space-y-3">{children}</div>}
    </section>
  );
}

function Row({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{term}</dt>
      <dd>{value}</dd>
    </div>
  );
}
