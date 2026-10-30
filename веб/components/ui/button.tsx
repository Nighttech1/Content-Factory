"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * Vernatun Dark Luxury button — Cobalt / Gold / Glass tokens only.
 * No --hu-* theme globals.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl text-sm font-semibold",
    "transition-[background-color,border-color,color,opacity,box-shadow] duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] focus-visible:ring-offset-0",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-[var(--accent-blue)] text-white shadow-[0_8px_24px_color-mix(in_srgb,var(--accent-blue)_28%,transparent)] hover:bg-[var(--accent-blue-bright)]",
        gold:
          "border border-[color-mix(in_srgb,var(--accent-gold)_40%,transparent)] bg-[color-mix(in_srgb,var(--accent-gold)_18%,transparent)] text-[var(--accent-gold)] hover:bg-[color-mix(in_srgb,var(--accent-gold)_28%,transparent)]",
        outline:
          "border border-[var(--border-glass)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
        ghost:
          "border border-transparent bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
        glass:
          "border border-[var(--border-glass)] bg-[color-mix(in_srgb,var(--bg-elevated)_88%,transparent)] text-[var(--text-primary)] backdrop-blur-sm hover:border-[color-mix(in_srgb,var(--accent-blue-bright)_35%,var(--border-glass))]",
        secondary:
          "border border-[var(--border-glass)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]",
        destructive:
          "border border-transparent bg-[color-mix(in_srgb,#ef4444_82%,transparent)] text-white hover:bg-[#ef4444]",
        link: "border-0 bg-transparent text-[var(--accent-blue-bright)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-3.5 py-2",
        sm: "h-8 rounded-lg px-2.5 text-xs",
        lg: "h-10 rounded-xl px-5 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
