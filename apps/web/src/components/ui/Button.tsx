import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-pin text-white hover:bg-pin/90 disabled:bg-pin/40",
  secondary: "bg-paper text-ink ring-1 ring-inset ring-ink/15 hover:bg-cork",
  ghost: "text-ink-soft hover:bg-ink/5",
  danger: "bg-danger text-white hover:bg-danger/90 disabled:bg-danger/40",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
