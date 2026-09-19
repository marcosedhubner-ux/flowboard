import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-pin text-white shadow-[0_1px_2px_rgba(42,35,26,0.15)] hover:bg-pin/90 hover:shadow-[0_4px_10px_rgba(47,122,77,0.3)] disabled:bg-pin/40",
  secondary: "bg-paper text-ink ring-1 ring-inset ring-ink/15 hover:bg-pin/10 hover:ring-pin/30",
  ghost: "text-ink-soft hover:bg-pin/10 hover:text-pin",
  danger: "bg-danger text-white shadow-[0_1px_2px_rgba(42,35,26,0.15)] hover:bg-danger/90 hover:shadow-[0_4px_10px_rgba(173,74,52,0.3)] disabled:bg-danger/40",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        // Picked up, not just clicked: a gentle lift on hover, a firm press
        // on active, and a settle back — same tactile language as the cards.
        "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-[background-color,box-shadow,transform,color] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] active:shadow-none disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pin focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
