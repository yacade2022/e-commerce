import { formatPrice, savingsPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PriceProps {
  price: number;
  listPrice?: number | null;
  size?: "sm" | "lg";
  className?: string;
}

export function Price({ price, listPrice = null, size = "sm", className }: PriceProps) {
  const savings = savingsPercent(price, listPrice);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      {savings !== null && (
        <span
          className={cn(
            "rounded bg-sale px-1.5 py-0.5 font-semibold text-white",
            size === "lg" ? "text-sm" : "text-xs",
          )}
        >
          {savings}% off
        </span>
      )}
      <span
        className={cn(
          "tabular font-display font-semibold text-foreground",
          size === "lg" ? "text-3xl" : "text-lg",
        )}
      >
        <span className="sr-only">Price: </span>
        {formatPrice(price)}
      </span>
      {savings !== null && listPrice && (
        <span className={cn("tabular text-muted-foreground", size === "lg" ? "text-base" : "text-sm")}>
          <span className="sr-only">Was </span>
          <s>{formatPrice(listPrice)}</s>
        </span>
      )}
    </div>
  );
}
