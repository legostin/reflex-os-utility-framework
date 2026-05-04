import * as React from "react";
import { cn } from "../cn";

export interface JsonViewProps {
  value: unknown;
  className?: string;
  /** Truncate long strings to this many chars. Defaults to 1024. */
  maxStringLength?: number;
  /** Initial open depth. Defaults to 2. */
  defaultDepth?: number;
}

/**
 * Compact, dependency-free JSON inspector. Designed for cases where dumping
 * a `Record<string, unknown>` from the bridge into the UI is enough — not a
 * full alternative to the host's debugger.
 */
export function JsonView({
  value,
  className,
  maxStringLength = 1024,
  defaultDepth = 2,
}: JsonViewProps) {
  return (
    <div
      className={cn(
        "bg-reflex-bg border border-reflex-border rounded p-3 font-mono text-xs leading-relaxed text-reflex-fg-soft overflow-auto",
        className,
      )}
    >
      <Node value={value} depth={0} maxStringLength={maxStringLength} defaultDepth={defaultDepth} />
    </div>
  );
}

function Node({
  value,
  depth,
  maxStringLength,
  defaultDepth,
}: {
  value: unknown;
  depth: number;
  maxStringLength: number;
  defaultDepth: number;
}) {
  const [open, setOpen] = React.useState(depth < defaultDepth);

  if (value === null) return <span className="text-reflex-fg-faint">null</span>;
  if (value === undefined) return <span className="text-reflex-fg-faint">undefined</span>;
  if (typeof value === "boolean") return <span className="text-reflex-warn">{String(value)}</span>;
  if (typeof value === "number") return <span className="text-reflex-warn">{value}</span>;
  if (typeof value === "string") {
    const truncated =
      value.length > maxStringLength ? value.slice(0, maxStringLength) + "…" : value;
    return <span className="text-reflex-ok">"{truncated}"</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span>[]</span>;
    return (
      <span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-reflex-link hover:underline"
        >
          {open ? "▾" : "▸"} [{value.length}]
        </button>
        {open && (
          <div className="pl-3 border-l border-reflex-border ml-1 mt-1 grid gap-0.5">
            {value.map((entry, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-reflex-fg-faint">{idx}</span>
                <Node
                  value={entry}
                  depth={depth + 1}
                  maxStringLength={maxStringLength}
                  defaultDepth={defaultDepth}
                />
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return <span>{"{}"}</span>;
    return (
      <span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-reflex-link hover:underline"
        >
          {open ? "▾" : "▸"} {"{"}
          {entries.length}
          {"}"}
        </button>
        {open && (
          <div className="pl-3 border-l border-reflex-border ml-1 mt-1 grid gap-0.5">
            {entries.map(([key, entry]) => (
              <div key={key} className="flex gap-2">
                <span className="text-reflex-fg-soft">{key}:</span>
                <Node
                  value={entry}
                  depth={depth + 1}
                  maxStringLength={maxStringLength}
                  defaultDepth={defaultDepth}
                />
              </div>
            ))}
          </div>
        )}
      </span>
    );
  }

  return <span>{String(value)}</span>;
}
