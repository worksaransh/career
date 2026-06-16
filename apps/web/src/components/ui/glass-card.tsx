"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils/cn";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "strong" | "light";
  hover?: boolean;
  children: React.ReactNode;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      variant = "default",
      hover = true,
      children,
      ...props
    },
    ref,
  ) => {
    const glassClass =
      variant === "strong"
        ? "glass-strong"
        : variant === "light"
          ? "glass-light"
          : "glass";

    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          glassClass,
          "rounded-xl p-6 transition-all duration-300",
          hover && "hover:shadow-glass-lg",
          className,
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);
GlassCard.displayName = "GlassCard";
