import { cn } from "@/lib/utils";

export const LOW_STOCK = 10;

export function StockStatus({ stock, className }: { stock: number; className?: string }) {
  if (stock <= 0) {
    return <p className={cn("text-sm font-medium text-sale", className)}>Out of stock</p>;
  }
  if (stock < LOW_STOCK) {
    return <p className={cn("text-sm font-medium text-sale", className)}>Only {stock} left in stock</p>;
  }
  return <p className={cn("text-sm font-medium text-ok", className)}>In stock</p>;
}
