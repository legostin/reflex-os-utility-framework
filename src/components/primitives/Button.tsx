import * as React from "react";
import { cn } from "../cn";

export type ButtonVariant = "default" | "primary" | "ghost" | "danger" | "subtle";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT: Record<ButtonVariant, string> = {
  default:
    "bg-reflex-surface-3 border border-reflex-border-strong text-reflex-fg hover:bg-reflex-border-strong",
  primary:
    "bg-reflex-accent border border-reflex-accent text-reflex-accent-fg hover:opacity-90",
  ghost:
    "bg-transparent border border-transparent text-reflex-fg-soft hover:bg-reflex-surface-2",
  danger:
    "bg-transparent border border-reflex-danger-border text-reflex-danger hover:bg-reflex-danger-border/30",
  subtle:
    "bg-reflex-surface-2 border border-reflex-border text-reflex-fg-soft hover:bg-reflex-surface-3",
};

const SIZE: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-xs rounded-sm",
  md: "px-3 py-2 text-sm rounded",
  lg: "px-4 py-2.5 text-sm rounded-md",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "default",
    size = "md",
    loading,
    leadingIcon,
    trailingIcon,
    className,
    children,
    disabled,
    type,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center gap-2 font-medium transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-reflex-link/60",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...rest}
    >
      {leadingIcon ? <span className="shrink-0">{leadingIcon}</span> : null}
      <span className="truncate">{loading ? "…" : children}</span>
      {trailingIcon ? <span className="shrink-0">{trailingIcon}</span> : null}
    </button>
  );
});
