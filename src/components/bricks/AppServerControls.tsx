import * as React from "react";
import { useAppServer } from "../../react/useApps";
import { Badge } from "../primitives/Badge";
import { Button } from "../primitives/Button";
import { Card } from "../primitives/Card";
import { EmptyState } from "../primitives/EmptyState";
import { StatusLine, type StatusTone } from "../primitives/StatusLine";
import { Toolbar } from "../primitives/Toolbar";
import { cn } from "../cn";

export interface AppServerControlsProps {
  appId: string | undefined;
  className?: string;
  pollIntervalMs?: number;
  /** Show a tail of `apps.server.logs`. Defaults to true. */
  showLogs?: boolean;
  logLimit?: number;
}

/**
 * Status panel for a server-runtime app: start/stop/restart, current health,
 * and an optional log tail. Polls `apps.server.status` while the panel is
 * mounted (default every 4s).
 */
export function AppServerControls({
  appId,
  className,
  pollIntervalMs = 4000,
  showLogs = true,
  logLimit = 80,
}: AppServerControlsProps) {
  const { status, logs, loading, error, start, stop, restart } = useAppServer(appId, {
    pollIntervalMs,
    withLogs: showLogs,
    logLimit,
  });
  const [actionStatus, setActionStatus] = React.useState<{ message: string; tone: StatusTone } | null>(null);

  if (!appId) {
    return (
      <EmptyState
        title="Pick an app"
        description="Select a server-runtime app to start, stop, or inspect its logs."
        className={className}
      />
    );
  }

  async function tryRun(label: string, fn: () => Promise<void>) {
    setActionStatus(null);
    try {
      await fn();
      setActionStatus({ message: `${label} ok.`, tone: "ok" });
    } catch (err) {
      setActionStatus({
        message: err instanceof Error ? err.message : String(err),
        tone: "danger",
      });
    }
  }

  return (
    <Card className={cn("grid gap-3", className)}>
      <header className="flex items-center gap-2 justify-between">
        <h3 className="text-sm font-medium">Server runtime</h3>
        <div className="flex items-center gap-2">
          {status?.running ? <Badge tone="ok">running</Badge> : <Badge tone="neutral">stopped</Badge>}
          {status?.health && status.health !== "ok" && (
            <Badge tone={status.health === "starting" ? "warn" : "danger"}>{status.health}</Badge>
          )}
        </div>
      </header>
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-reflex-fg-faint uppercase tracking-wider">Port</dt>
          <dd className="text-reflex-fg-soft font-mono">{status?.port ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-reflex-fg-faint uppercase tracking-wider">PID</dt>
          <dd className="text-reflex-fg-soft font-mono">{status?.pid ?? "—"}</dd>
        </div>
      </dl>
      <Toolbar>
        <Button variant="primary" onClick={() => void tryRun("start", start)} disabled={loading || status?.running}>
          Start
        </Button>
        <Button variant="ghost" onClick={() => void tryRun("stop", stop)} disabled={loading || !status?.running}>
          Stop
        </Button>
        <Button variant="subtle" onClick={() => void tryRun("restart", restart)} disabled={loading}>
          Restart
        </Button>
        {actionStatus && <StatusLine tone={actionStatus.tone}>{actionStatus.message}</StatusLine>}
      </Toolbar>
      {error ? <StatusLine tone="danger">{String(error)}</StatusLine> : null}
      {showLogs && (
        <section className="grid gap-1.5">
          <h4 className="text-xs uppercase tracking-wider text-reflex-fg-muted">Logs</h4>
          {logs.length === 0 ? (
            <p className="text-xs text-reflex-fg-faint">No log lines yet.</p>
          ) : (
            <ul className="bg-reflex-bg border border-reflex-border rounded font-mono text-xxs max-h-[280px] overflow-auto">
              {logs.map((entry, idx) => (
                <li
                  key={(entry.ts_ms ?? 0) + ":" + idx}
                  className="grid grid-cols-[auto_1fr] gap-2 px-2 py-1 border-b border-reflex-border last:border-b-0 text-reflex-fg-soft"
                >
                  <span className="text-reflex-fg-faint">
                    {entry.ts_ms ? new Date(entry.ts_ms).toLocaleTimeString() : "—"}
                  </span>
                  <span className="break-words">{entry.message}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </Card>
  );
}
