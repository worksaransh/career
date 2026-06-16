import React from "react";

import { cn } from "@/lib/utils/cn";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "shimmer" | "card";
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(
          variant === "shimmer" ? "skeleton-shimmer" : "skeleton",
          className,
        )}
        {...props}
      />
    );
  },
);
Skeleton.displayName = "Skeleton";

export const SkeletonCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-border p-5 space-y-4",
      className,
    )}
    {...props}
  >
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
    <Skeleton className="h-20 w-full" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
));
SkeletonCard.displayName = "SkeletonCard";

export const SkeletonTableRow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-4 py-3", className)}
    {...props}
  >
    <Skeleton className="h-10 w-10 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="h-8 w-24" />
  </div>
));
SkeletonTableRow.displayName = "SkeletonTableRow";
