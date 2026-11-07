"use client";

import Link from "next/link";
import { useEffect } from "react";
import { TriangleAlertIcon } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = error instanceof Error && "digest" in error ? String(error.digest) : undefined;
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page">
      <EmptyState
        icon={TriangleAlertIcon}
        headingLevel="h1"
        title="This page didn’t load"
        description={
          <p>
            Something went wrong while loading this page. Try again, or go back to the homepage. Your cart is saved.
            {digest && <span className="mt-2 block text-xs">Reference: {digest}</span>}
          </p>
        }
        className="py-24"
      >
        <Button onClick={() => retry()} className="h-10 px-5">
          Try again
        </Button>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }), "h-10 px-5")}>
          Go to the homepage
        </Link>
      </EmptyState>
    </div>
  );
}
