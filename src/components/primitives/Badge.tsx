import * as React from "react";
import { cn } from "../cn";

export type BadgeTone = "neutral" | "info" | "warn" | "danger" | "ok";

const TONE: Record<BadgeTone, string> = {
  neutral: "bg-reflex-surface-3 text-reflex-fg-soft border-reflex-border",
  info: "bg-reflex-link/15 text-reflex-link border-reflex-link/30",
  warn: "bg-reflex-warn/15 text-reflex-warn border-reflex-warn/30",
  danger: "bg-reflex-danger-border/40 text-reflex-danger border-reflex-danger-border",
  ok: "bg-reflex-ok/15 text-reflex-ok border-reflex-ok/30",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = "neutral", className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xxs uppercase tracking-wider font-medium rounded-sm border",
        TONE[tone],
        className,
      )}
      {...rest}
    />
  );
}
