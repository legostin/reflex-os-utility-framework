import * as React from "react";
import { cn } from "../cn";

export type StatusTone = "neutral" | "ok" | "warn" | "danger";

const TONE: Record<StatusTone, string> = {
  neutral: "text-reflex-fg-muted",
  ok: "text-reflex-ok",
  warn: "text-reflex-warn",
  danger: "text-reflex-danger",
};

export interface StatusLineProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: StatusTone;
}

export function StatusLine({ tone = "neutral", className, children, ...rest }: StatusLineProps) {
  return (
    <div
      role="status"
      className={cn("min-h-[20px] text-xs leading-relaxed", TONE[tone], className)}
      {...rest}
    >
      {children}
    </div>
  );
}
