import * as React from "react";
import { cn } from "../cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  /** Lock body scroll while open. Defaults to true. */
  lockScroll?: boolean;
  /** Close on Escape. Defaults to true. */
  closeOnEscape?: boolean;
  /** Close on backdrop click. Defaults to true. */
  closeOnBackdrop?: boolean;
}

/**
 * Lightweight modal. Renders inline (no portal) — Reflex utilities run in an
 * iframe sized by the host so a portal adds no value here.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  footer,
  className,
  children,
  lockScroll = true,
  closeOnEscape = true,
  closeOnBackdrop = true,
}: ModalProps) {
  React.useEffect(() => {
    if (!open || !closeOnEscape) return undefined;
    const handle = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open, onClose, closeOnEscape]);

  React.useEffect(() => {
    if (!open || !lockScroll || typeof document === "undefined") return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, lockScroll]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm"
      onClick={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "max-h-[85vh] w-[min(540px,calc(100%-32px))] grid grid-rows-[auto_minmax(0,1fr)_auto] gap-3",
          "bg-reflex-surface border border-reflex-border rounded-md shadow-reflex-pop p-5",
          className,
        )}
      >
        {(title || description) && (
          <header className="grid gap-1">
            {title && <h2 className="text-base font-semibold tracking-tight">{title}</h2>}
            {description && (
              <p className="text-xs text-reflex-fg-muted leading-relaxed">{description}</p>
            )}
          </header>
        )}
        <div className="overflow-auto">{children}</div>
        {footer && <footer className="flex items-center gap-2 justify-end">{footer}</footer>}
      </div>
    </div>
  );
}

export function useModal(initial = false) {
  const [open, setOpen] = React.useState(initial);
  const show = React.useCallback(() => setOpen(true), []);
  const hide = React.useCallback(() => setOpen(false), []);
  const toggle = React.useCallback(() => setOpen((o) => !o), []);
  return { open, show, hide, toggle, setOpen };
}
