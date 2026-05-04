import * as React from "react";
import { cn } from "../cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, padded = true, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-reflex-surface border border-reflex-border rounded-md shadow-reflex-card",
        padded && "p-4",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

export interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  toolbar?: React.ReactNode;
}

export function Section({
  title,
  description,
  toolbar,
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <section
      className={cn(
        "bg-reflex-surface border border-reflex-border rounded-md p-4 grid gap-3",
        className,
      )}
      {...rest}
    >
      {(title || toolbar || description) && (
        <header className="flex items-start gap-3 justify-between">
          <div className="grid gap-0.5 min-w-0">
            {title && (
              <h2 className="text-sm font-medium text-reflex-fg-soft truncate">{title}</h2>
            )}
            {description && (
              <p className="text-xs text-reflex-fg-muted leading-relaxed">{description}</p>
            )}
          </div>
          {toolbar && <div className="flex gap-2 shrink-0">{toolbar}</div>}
        </header>
      )}
      <div className="grid gap-3 min-w-0">{children}</div>
    </section>
  );
}
