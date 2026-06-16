"use client";

import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { buttonVariants, type ButtonVariants } from "@/lib/utils/variants";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        ) : leftIcon ? (
          <span className="mr-2" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}
        {children}
        {rightIcon && !loading ? (
          <span className="ml-2" aria-hidden="true">
            {rightIcon}
          </span>
        ) : null}
      </Comp>
    );
  },
);
Button.displayName = "Button";
