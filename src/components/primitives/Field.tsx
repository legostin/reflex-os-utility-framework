import * as React from "react";
import { cn } from "../cn";

const CONTROL_BASE =
  "w-full bg-reflex-surface-3 border border-reflex-border-strong rounded-sm text-reflex-fg " +
  "px-2.5 py-2 text-sm placeholder:text-reflex-fg-faint " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-reflex-link/60";

export interface FieldProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, description, error, htmlFor, className, children }: FieldProps) {
  return (
    <label className={cn("grid gap-1", className)} htmlFor={htmlFor}>
      {label && (
        <span className="text-xs uppercase tracking-wide text-reflex-fg-muted">{label}</span>
      )}
      {children}
      {description && !error ? (
        <span className="text-xs text-reflex-fg-faint">{description}</span>
      ) : null}
      {error ? <span className="text-xs text-reflex-danger">{error}</span> : null}
    </label>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cn(CONTROL_BASE, className)} {...rest} />;
  },
);

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, rows = 4, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(CONTROL_BASE, "min-h-[96px] resize-y leading-relaxed", className)}
      {...rest}
    />
  );
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, ...rest }, ref) {
  return <select ref={ref} className={cn(CONTROL_BASE, "appearance-auto", className)} {...rest} />;
});
