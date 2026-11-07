import Link from "next/link";
import { PackageSearchIcon } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="container-page">
      <EmptyState
        icon={PackageSearchIcon}
        headingLevel="h1"
        title="This page isn’t on the shelf"
        description={<p>The link may be out of date, or the product may no longer be listed. Try searching instead.</p>}
        className="py-24"
      >
        <Link href="/search" className={cn(buttonVariants(), "h-10 px-5")}>
          Browse all products
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "h-10 px-5")}>
          Go to the homepage
        </Link>
      </EmptyState>
    </div>
  );
}
