import * as React from "react";
import { cn } from "../cn";

export interface SplitGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tailwind-friendly grid template, e.g. "minmax(280px,.95fr) minmax(320px,1.05fr)" */
  template?: string;
  /** Gap in px (default 16). */
  gap?: number;
}

export function SplitGrid({
  template = "minmax(280px,1fr) minmax(280px,1fr)",
  gap = 16,
  className,
  style,
  children,
  ...rest
}: SplitGridProps) {
  return (
    <div
      className={cn("grid grid-cols-1 lg:[grid-template-columns:var(--rufw-cols)]", className)}
      style={{
        // CSS variable carries the template through media queries cleanly.
        ["--rufw-cols" as never]: template,
        gap: `${gap}px`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
