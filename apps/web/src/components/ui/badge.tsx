import React from "react";

import { cn } from "@/lib/utils/cn";
import { badgeVariants, type BadgeVariants } from "@/lib/utils/variants";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    BadgeVariants {}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Badge.displayName = "Badge";
