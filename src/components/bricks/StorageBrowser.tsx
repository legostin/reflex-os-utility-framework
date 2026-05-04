import * as React from "react";
import { useBridge } from "../../react/ReflexProvider";
import { Button } from "../primitives/Button";
import { Card } from "../primitives/Card";
import { EmptyState } from "../primitives/EmptyState";
import { Toolbar } from "../primitives/Toolbar";
import { cn } from "../cn";

export interface StorageBrowserProps {
  prefix?: string;
  className?: string;
  /** Render a custom inspector for the active value. */
  renderValue?: (key: string, value: unknown) => React.ReactNode;
}

/**
 * List + inspect this app's `storage.*` entries. Useful inside developer-mode
 * utilities; for end-user UIs prefer typed accessors via `useStorage`.
 */
export function StorageBrowser({ prefix, className, renderValue }: StorageBrowserProps) {
  const bridge = useBridge();
  const [entries, setEntries] = React.useState<Array<{ key: string; value: unknown }>>([]);
  const [active, setActive] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await bridge.storage.list(prefix !== undefined ? { prefix } : {});
      setEntries(result.entries ?? []);
    } finally {
      setLoading(false);
    }
  }, [bridge, prefix]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const activeEntry = entries.find((entry) => entry.key === active);

  return (
    <div className={cn("grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)]", className)}>
      <Card padded={false} className="overflow-hidden">
        <Toolbar className="border-b border-reflex-border px-3 py-2">
          <span className="text-xs text-reflex-fg-muted">{entries.length} keys</span>
          <Button size="sm" variant="ghost" onClick={() => void reload()}>
            Reload
          </Button>
        </Toolbar>
        {loading && entries.length === 0 ? (
          <div className="px-3 py-3 text-xs text-reflex-fg-muted">Loading…</div>
        ) : entries.length === 0 ? (
          <EmptyState
            title="No keys"
            description={prefix ? `No entries under prefix "${prefix}".` : "Storage is empty."}
          />
        ) : (
          <ul className="max-h-[400px] overflow-auto">
            {entries.map((entry) => (
              <li key={entry.key}>
                <button
                  type="button"
                  onClick={() => setActive(entry.key)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs font-mono border-b border-reflex-border last:border-b-0",
                    active === entry.key
                      ? "bg-reflex-surface-3 text-reflex-fg"
                      : "hover:bg-reflex-surface-2 text-reflex-fg-soft",
                  )}
                >
                  {entry.key}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card>
        {activeEntry ? (
          <div className="grid gap-2 min-w-0">
            <div className="flex items-center gap-2 justify-between">
              <span className="text-xs font-mono break-all">{activeEntry.key}</span>
              <Button
                size="sm"
                variant="danger"
                onClick={async () => {
                  await bridge.storage.delete(activeEntry.key);
                  setActive(null);
                  await reload();
                }}
              >
                Delete
              </Button>
            </div>
            <div className="bg-reflex-bg border border-reflex-border rounded p-3 font-mono text-xs overflow-auto max-h-[400px]">
              {renderValue ? (
                renderValue(activeEntry.key, activeEntry.value)
              ) : (
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(activeEntry.value, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ) : (
          <EmptyState title="Pick a key" description="Click any key on the left to inspect." />
        )}
      </Card>
    </div>
  );
}
