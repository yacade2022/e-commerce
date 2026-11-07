import Link from "next/link";
import { cn } from "@/lib/utils";

/** Original Stockroom mark: a stocked shelf unit. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-8", className)}>
      <rect x="2" y="2" width="28" height="28" rx="6" fill="var(--sun)" />
      <path d="M8 12.5h16M8 20.5h16" stroke="var(--pine)" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="9.5" y="6.5" width="5" height="5" rx="1" fill="var(--pine)" />
      <rect x="16.5" y="14.5" width="7" height="5" rx="1" fill="var(--pine)" />
      <rect x="10" y="22.5" width="4" height="4" rx="1" fill="var(--pine)" />
      <rect x="15.5" y="22.5" width="4" height="4" rx="1" fill="var(--pine)" />
    </svg>
  );
}

export function Logo({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-md font-display text-xl font-semibold tracking-tight",
        tone === "light" ? "text-white" : "text-foreground",
        className,
      )}
    >
      <LogoMark />
      <span>Stockroom</span>
      <span className="sr-only">home</span>
    </Link>
  );
}
