"use client";

import Link from "next/link";
import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { departments } from "@/data/taxonomy";
import { LogoMark } from "./logo";

const secondary = [
  { href: "/search?sale=1&sort=savings", label: "Deals" },
  { href: "/cart", label: "Cart" },
  { href: "/faq", label: "Help & FAQ" },
  { href: "/contact", label: "Contact us" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="inline-flex size-11 items-center justify-center rounded-lg text-white hover:bg-white/10 lg:hidden"
        aria-label="Open menu"
      >
        <MenuIcon className="size-6" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-sm gap-0 overflow-y-auto p-0">
        <SheetHeader className="flex-row items-center gap-2 bg-spruce px-4 py-4 text-white">
          <LogoMark className="size-7" />
          <SheetTitle className="font-display text-lg text-white">Browse Stockroom</SheetTitle>
        </SheetHeader>
        <nav aria-label="Departments" className="px-2 py-3">
          <p className="px-3 pb-2 text-sm font-semibold text-muted-foreground">Shop by aisle</p>
          <ul>
            {departments.map((d) => (
              <li key={d.slug}>
                <Link
                  href={`/search?dept=${d.slug}`}
                  onClick={close}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-accent"
                >
                  <span className="tabular w-5 font-display text-lg font-semibold text-spruce">{d.aisle}</span>
                  <span className="font-medium">{d.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="More" className="border-t px-2 py-3">
          <ul>
            {secondary.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={close} className="block rounded-md px-3 py-2.5 hover:bg-accent">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
