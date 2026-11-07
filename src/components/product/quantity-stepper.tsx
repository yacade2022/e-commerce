"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
  size?: "sm" | "md";
  className?: string;
}

export function QuantityStepper({ value, max, onChange, label, size = "md", className }: QuantityStepperProps) {
  const btn = cn(
    "flex items-center justify-center text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40",
    size === "sm" ? "size-8" : "size-10",
  );
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center overflow-hidden rounded-lg border border-input bg-white", className)}
    >
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        <MinusIcon className="size-4" aria-hidden="true" />
      </button>
      <output
        aria-live="polite"
        aria-label="Quantity"
        className={cn("tabular text-center font-semibold", size === "sm" ? "w-8 text-sm" : "w-10")}
      >
        {value}
      </output>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <PlusIcon className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
