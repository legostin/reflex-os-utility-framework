import * as React from "react";
import { useBridge } from "../../react/ReflexProvider";
import type { LogEntry } from "../../bridge/types";
import { Badge } from "../primitives/Badge";
import { Button } from "../primitives/Button";
import { Card } from "../primitives/Card";
import { EmptyState } from "../primitives/EmptyState";
import { Field, Input, Select } from "../primitives/Field";
import { Toolbar } from "../primitives/Toolbar";
import { cn } from "../cn";

export interface LogViewerProps {
  /** Polling cadence. 0 disables auto-refresh. */
  pollIntervalMs?: number;
  defaultSource?: string;
  defaultLevel?: string;
  limit?: number;
  className?: string;
}

const LEVEL_TONE: Record<string, "info" | "warn" | "danger" | "neutral"> = {
  debug: "neutral",
  info: "info",
  warn: "warn",
  error: "danger",
};

/**
 * Tail of `logs.list` with per-source / per-level filters. Polling by default
 * because the host does not push log events through the bridge.
 */
export function LogViewer({
  pollIntervalMs = 5000,
  defaultSource,
  defaultLevel,
  limit = 100,
  className,
}: LogViewerProps) {
  const bridge = useBridge();
  const [entries, setEntries] = React.useState<LogEntry[]>([]);
  const [source, setSource] = React.useState(defaultSource ?? "");
  const [level, setLevel] = React.useState(defaultLevel ?? "");
  const [error, setError] = React.useState<unknown>(null);

  const reload = React.useCallback(async () => {
    try {
      const params: { limit: number; source?: string; level?: string } = { limit };
      if (source) params.source = source;
      if (level) params.level = level;
      const result = await bridge.system.logList(params);
      setEntries(result.entries ?? []);
      setError(null);
    } catch (err) {
      setError(err);
    }
  }, [bridge, limit, source, level]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  React.useEffect(() => {
    if (!pollIntervalMs) return undefined;
    const handle = setInterval(() => {
      void reload();
    }, pollIntervalMs);
    return () => clearInterval(handle);
  }, [pollIntervalMs, reload]);

  return (
    <Card className={cn("grid gap-3", className)} padded={false}>
      <Toolbar className="px-3 pt-3">
        <Field label="Source" className="flex-1 min-w-[160px]">
          <Input
            value={source}
            onChange={(event) => setSource(event.target.value)}
            placeholder="app:my-utility"
          />
        </Field>
        <Field label="Level" className="w-32">
          <Select value={level} onChange={(event) => setLevel(event.target.value)}>
            <option value="">all</option>
            <option value="debug">debug</option>
            <option value="info">info</option>
            <option value="warn">warn</option>
            <option value="error">error</option>
          </Select>
        </Field>
        <Button variant="ghost" onClick={() => void reload()} className="self-end">
          Refresh
        </Button>
      </Toolbar>
      {error ? <div className="px-3 text-xs text-reflex-danger">{String(error)}</div> : null}
      {entries.length === 0 ? (
        <EmptyState title="No log entries" description="Adjust filters or wait for activity." />
      ) : (
        <ul className="font-mono text-xxs max-h-[400px] overflow-auto border-t border-reflex-border">
          {entries.map((entry, idx) => (
            <li
              key={(entry.seq ?? entry.ts_ms ?? 0) + ":" + idx}
              className="grid grid-cols-[auto_auto_1fr] gap-2 px-3 py-1.5 border-b border-reflex-border last:border-b-0"
            >
              <span className="text-reflex-fg-faint">
                {entry.ts_ms ? new Date(entry.ts_ms).toLocaleTimeString() : "—"}
              </span>
              <Badge tone={LEVEL_TONE[entry.level ?? "info"] ?? "neutral"}>
                {entry.level ?? "info"}
              </Badge>
              <span className="break-words text-reflex-fg-soft">
                {entry.source ? <span className="text-reflex-fg-muted">[{entry.source}] </span> : null}
                {entry.message}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
