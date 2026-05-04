import * as React from "react";
import { cn } from "../cn";

export type ToastTone = "info" | "ok" | "warn" | "danger";

export interface ToastDescriptor {
  id: string;
  tone?: ToastTone;
  title?: React.ReactNode;
  body?: React.ReactNode;
  /** Auto-dismiss after N ms. 0 disables auto-dismiss. Default: 4000. */
  durationMs?: number;
}

export interface ToastContextValue {
  show: (toast: Omit<ToastDescriptor, "id"> & { id?: string }) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const TONE_CLASSES: Record<ToastTone, string> = {
  info: "bg-reflex-surface-2 border-reflex-border text-reflex-fg-soft",
  ok: "bg-reflex-ok/15 border-reflex-ok/30 text-reflex-ok",
  warn: "bg-reflex-warn/15 border-reflex-warn/30 text-reflex-warn",
  danger: "bg-reflex-danger-border/40 border-reflex-danger-border text-reflex-danger",
};

let toastCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastDescriptor[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const show = React.useCallback<ToastContextValue["show"]>(
    (input) => {
      const id = input.id ?? `toast-${++toastCounter}`;
      const toast: ToastDescriptor = { tone: "info", durationMs: 4000, ...input, id };
      setToasts((prev) => [...prev.filter((t) => t.id !== id), toast]);
      if (toast.durationMs && toast.durationMs > 0) {
        setTimeout(() => dismiss(id), toast.durationMs);
      }
      return id;
    },
    [dismiss],
  );

  const clear = React.useCallback(() => setToasts([]), []);

  const value = React.useMemo<ToastContextValue>(
    () => ({ show, dismiss, clear }),
    [show, dismiss, clear],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        className="pointer-events-none fixed top-3 right-3 z-50 flex flex-col gap-2 max-w-sm"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto border rounded-md p-3 shadow-reflex-pop grid gap-1",
              TONE_CLASSES[toast.tone ?? "info"],
            )}
          >
            {toast.title && <div className="text-sm font-medium">{toast.title}</div>}
            {toast.body && <div className="text-xs leading-relaxed">{toast.body}</div>}
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="self-end text-xxs uppercase tracking-wider opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}
