import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass:
          "glass text-foreground hover:bg-white/30 dark:hover:bg-white/10 shadow-soft",
        gradient:
          "bg-gradient-to-r from-primary to-purple-600 text-white shadow-md hover:shadow-lg hover:shadow-primary/20 hover:from-primary/90 hover:to-purple-600/90",
      },
      size: {
        xs: "h-7 px-2 text-xs rounded-md",
        sm: "h-8 px-3 text-xs rounded-md",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 py-3 text-base rounded-xl",
        xl: "h-14 px-8 py-4 text-base rounded-xl",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const cardVariants = cva(
  "rounded-xl border transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground shadow-card hover:shadow-card-hover",
        glass: "glass shadow-glass",
        glassStrong: "glass-strong",
        outline: "border-border bg-transparent",
        elevated:
          "bg-card text-card-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5",
        gradient:
          "bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950 dark:to-primary-900 border-primary-200 dark:border-primary-800",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-5",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  },
);

export const inputVariants = cva(
  "flex w-full rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input hover:border-primary/50",
        glass:
          "glass border-glass-border hover:bg-white/30 dark:hover:bg-white/10",
        error: "border-destructive focus-visible:ring-destructive",
      },
      size: {
        sm: "h-8 px-2 text-xs",
        md: "h-10",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        success:
          "border-transparent bg-success/10 text-success dark:bg-success/20",
        warning:
          "border-transparent bg-warning/10 text-warning dark:bg-warning/20",
        info: "border-transparent bg-info/10 text-info dark:bg-info/20",
        glass: "glass border-glass-border",
        premium:
          "border-transparent bg-gradient-to-r from-primary to-purple-600 text-white",
      },
      size: {
        sm: "px-1.5 py-0 text-2xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
export type CardVariants = VariantProps<typeof cardVariants>;
export type InputVariants = VariantProps<typeof inputVariants>;
export type BadgeVariants = VariantProps<typeof badgeVariants>;
