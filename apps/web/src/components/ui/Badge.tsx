import clsx from "clsx";
import type { ReactNode } from "react";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

const toneStyles: Record<BadgeTone, string> = {
  neutral: "bg-ink/5 text-ink-soft ring-ink/15",
  success: "bg-pin/10 text-pin ring-pin/30",
  warning: "bg-pin-amber/15 text-warning ring-pin-amber/40",
  danger: "bg-pin-coral/15 text-danger ring-pin-coral/40",
  info: "bg-info/10 text-info ring-info/30",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneStyles[tone]
      )}
    >
      {children}
    </span>
  );
}
