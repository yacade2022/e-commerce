import type { Metadata, Viewport } from "next";
import { Familjen_Grotesk, Instrument_Sans } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Toaster } from "@/components/ui/sonner";
import { site } from "@/data/site";
import { getSearchSuggestions } from "@/lib/catalog";
import "./globals.css";

const display = Familjen_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} | Demo storefront`,
    template: `%s | ${site.name}`,
  },
  description: "A demo e-commerce storefront built with Next.js. Products and prices are sample data.",
};

export const viewport: Viewport = {
  themeColor: "#0e3b36",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const suggestions = getSearchSuggestions();
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-sun px-4 py-2 font-semibold text-pine focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          Skip to content
        </a>
        <p className="bg-mint py-1.5 text-center text-xs text-pine sm:text-sm">
          Demo store: products and prices are sample data, and no orders are placed.
        </p>
        <SiteHeader suggestions={suggestions} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <Toaster position="top-center" theme="light" closeButton />
      </body>
    </html>
  );
}
