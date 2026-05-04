import * as React from "react";
import { cn } from "../cn";

export interface EmptyStateProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center gap-2 py-8 px-4 border border-dashed border-reflex-border rounded-md text-reflex-fg-muted",
        className,
      )}
    >
      {title && <div className="text-sm font-medium text-reflex-fg-soft">{title}</div>}
      {description && <div className="text-xs leading-relaxed max-w-md">{description}</div>}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
