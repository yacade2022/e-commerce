import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  headingLevel?: "h1" | "h2";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
  headingLevel: Heading = "h2",
}: EmptyStateProps) {
  return (
    <div className={cn("mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center", className)}>
      <span className="flex size-14 items-center justify-center rounded-full bg-mint text-spruce">
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <Heading className="mt-5 text-2xl font-semibold">{title}</Heading>
      <div className="mt-2 text-muted-foreground">{description}</div>
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
