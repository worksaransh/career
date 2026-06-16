"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";

import { cn } from "@/lib/utils/cn";

interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fadeUp" | "fadeIn" | "slideUp" | "scaleIn" | "none";
  delay?: number;
  duration?: number;
  once?: boolean;
  as?: "div" | "section" | "article" | "span";
}

const animations: Record<string, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
};

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  className,
  animation = "fadeUp",
  delay = 0,
  duration = 0.5,
  once = true,
  as: Component = "div",
}) => {
  if (animation === "none") {
    return <Component className={className}>{children}</Component>;
  }

  const MotionComponent = motion[Component as keyof typeof motion] as React.ElementType;

  return (
    <MotionComponent
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-50px" }}
      variants={animations[animation]}
      transition={{ duration, delay, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </MotionComponent>
  );
};
