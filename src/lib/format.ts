const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatPrice(value: number): string {
  return usd.format(value);
}

/** Drops the cents for whole amounts, e.g. $50 or +$100, for use in running copy. */
export function formatPriceCompact(value: number): string {
  return Number.isInteger(value) ? `$${value.toLocaleString("en-US")}` : usd.format(value);
}

export function savingsPercent(price: number, listPrice: number | null): number | null {
  if (!listPrice || listPrice <= price) return null;
  return Math.round((1 - price / listPrice) * 100);
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
