import * as React from "react";
import { cn } from "../cn";

export interface AppShellProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  toolbar?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Default Reflex utility chrome: a single-column app with a sticky header and
 * an optional sidebar. Mirrors the layout used by built-in apps so generated
 * utilities feel native to the host shell.
 */
export function AppShell({
  title,
  subtitle,
  toolbar,
  sidebar,
  footer,
  children,
  className,
}: AppShellProps) {
  return (
    <div className={cn("min-h-screen bg-reflex-bg text-reflex-fg flex flex-col", className)}>
      <header className="sticky top-0 z-10 bg-reflex-surface/80 backdrop-blur border-b border-reflex-border px-5 py-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="grid gap-0.5 min-w-0 flex-1">
            <h1 className="text-base font-semibold tracking-tight truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-reflex-fg-muted leading-relaxed truncate">{subtitle}</p>
            )}
          </div>
          {toolbar && <div className="flex items-center gap-2 flex-wrap">{toolbar}</div>}
        </div>
      </header>
      <div className="flex-1 grid gap-4 px-5 py-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        {sidebar && (
          <aside className="hidden lg:flex flex-col gap-3 min-w-0">{sidebar}</aside>
        )}
        <main className="grid gap-4 min-w-0">{children}</main>
      </div>
      {footer && (
        <footer className="border-t border-reflex-border px-5 py-3 text-xs text-reflex-fg-muted">
          {footer}
        </footer>
      )}
    </div>
  );
}
