"use client";

import React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils/cn";

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  variant?: "default" | "success" | "gradient";
  showLabel?: boolean;
  labelPosition?: "inside" | "outside" | "tooltip";
}

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value = 0,
      variant = "default",
      showLabel = false,
      labelPosition = "outside",
      ...props
    },
    ref,
  ) => {
    const clampedValue = Math.min(Math.max(value ?? 0, 0), 100);

    return (
      <div className="w-full">
        {showLabel && labelPosition === "outside" && (
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs font-medium tabular-nums">
              {Math.round(clampedValue)}%
            </span>
          </div>
        )}
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
            className,
          )}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={clampedValue}
          role="progressbar"
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              "h-full w-full flex-1 rounded-full transition-all duration-500 ease-out",
              variant === "default" && "bg-primary",
              variant === "success" && "progress-gradient-success",
              variant === "gradient" && "progress-gradient",
            )}
            style={{ transform: `translateX(-${100 - clampedValue}%)` }}
          />
        </ProgressPrimitive.Root>
        {showLabel && labelPosition === "inside" && (
          <div className="mt-1 text-right">
            <span className="text-xs font-medium tabular-nums">
              {Math.round(clampedValue)}%
            </span>
          </div>
        )}
      </div>
    );
  },
);
Progress.displayName = "Progress";
