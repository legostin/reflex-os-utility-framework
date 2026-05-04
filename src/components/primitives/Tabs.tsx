import * as React from "react";
import { cn } from "../cn";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  idPrefix: string;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

export interface TabsProps {
  /** Controlled active tab id. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

let counter = 0;

export function Tabs({ value, defaultValue, onValueChange, className, children }: TabsProps) {
  const [internal, setInternal] = React.useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const current = isControlled ? value! : internal;
  const idPrefix = React.useMemo(() => `rufw-tabs-${++counter}-`, []);
  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );
  const ctx = React.useMemo<TabsContextValue>(
    () => ({ value: current, setValue, idPrefix }),
    [current, setValue, idPrefix],
  );
  return (
    <TabsContext.Provider value={ctx}>
      <div className={cn("grid gap-3", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

function useTabs() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs subcomponents must live inside <Tabs>");
  return ctx;
}

export interface TabListProps {
  className?: string;
  children: React.ReactNode;
}

export function TabList({ className, children }: TabListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex flex-wrap gap-1 p-1 bg-reflex-surface-2 border border-reflex-border rounded",
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Stable id matching a TabPanel `value`. */
  value: string;
}

export function Tab({ value, className, children, ...rest }: TabProps) {
  const tabs = useTabs();
  const active = tabs.value === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${tabs.idPrefix}tab-${value}`}
      aria-selected={active}
      aria-controls={`${tabs.idPrefix}panel-${value}`}
      tabIndex={active ? 0 : -1}
      onClick={() => tabs.setValue(value)}
      className={cn(
        "px-3 py-1.5 text-sm rounded-sm transition-colors",
        active
          ? "bg-reflex-surface-3 text-reflex-fg shadow-reflex-card"
          : "text-reflex-fg-muted hover:bg-reflex-surface-3/60 hover:text-reflex-fg-soft",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export interface TabPanelProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  /** Always render the children, even when inactive. Defaults to lazy. */
  forceMount?: boolean;
}

export function TabPanel({ value, className, children, forceMount }: TabPanelProps) {
  const tabs = useTabs();
  const active = tabs.value === value;
  if (!active && !forceMount) return null;
  return (
    <div
      role="tabpanel"
      hidden={!active}
      id={`${tabs.idPrefix}panel-${value}`}
      aria-labelledby={`${tabs.idPrefix}tab-${value}`}
      className={cn(active ? "" : "hidden", className)}
    >
      {children}
    </div>
  );
}
