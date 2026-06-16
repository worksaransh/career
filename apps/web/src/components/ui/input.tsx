"use client";

import React, { forwardRef, useState } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { inputVariants, type InputVariants } from "@/lib/utils/variants";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    InputVariants {
  label?: string;
  hint?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      label,
      hint,
      error,
      success,
      leftIcon,
      rightIcon,
      type,
      id,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const isPassword = type === "password";
    const inputVariant = error ? "error" : variant;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={isPassword && showPassword ? "text" : type}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : hint
                  ? `${inputId}-hint`
                  : undefined
            }
            className={cn(
              inputVariants({ variant: inputVariant, size }),
              leftIcon && "pl-10",
              (rightIcon || isPassword) && "pr-10",
              className,
            )}
            {...props}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isPassword ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            ) : rightIcon ? (
              <span className="text-muted-foreground">{rightIcon}</span>
            ) : error ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : success ? (
              <CheckCircle2 className="h-4 w-4 text-success" />
            ) : null}
          </div>
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-sm text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
