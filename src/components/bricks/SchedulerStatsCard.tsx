import * as React from "react";
import { useSchedulerStats } from "../../react/useScheduler";
import { Badge } from "../primitives/Badge";
import { Card } from "../primitives/Card";
import { cn } from "../cn";

export interface SchedulerStatsCardProps {
  appId?: string;
  includeAll?: boolean;
  recentLimit?: number;
  className?: string;
}

/**
 * Compact "scheduler health" card: counts, next-fire timestamp, last error.
 * Pairs with `SchedulerRunsLog` for the full picture.
 */
export function SchedulerStatsCard({
  appId,
  includeAll,
  recentLimit = 5,
  className,
}: SchedulerStatsCardProps) {
  const params: { appId?: string; includeAll?: boolean; recentLimit?: number } = { recentLimit };
  if (appId !== undefined) params.appId = appId;
  if (includeAll !== undefined) params.includeAll = includeAll;

  const { data, loading, error } = useSchedulerStats(params);

  if (loading && !data) {
    return <div className={cn("text-xs text-reflex-fg-muted", className)}>Loading scheduler stats…</div>;
  }

  if (error) {
    return <div className={cn("text-xs text-reflex-danger", className)}>{String(error)}</div>;
  }

  const stats = data ?? {};
  const next = stats.next_fire_at_ms ? new Date(stats.next_fire_at_ms).toLocaleString() : "—";
  const lastError = stats.last_error?.message;

  return (
    <Card className={cn("grid gap-2", className)}>
      <header className="flex items-baseline gap-2 justify-between">
        <h3 className="text-sm font-medium">Scheduler health</h3>
        {lastError ? <Badge tone="danger">errors</Badge> : <Badge tone="ok">healthy</Badge>}
      </header>
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-reflex-fg-faint uppercase tracking-wider">Total</dt>
          <dd className="text-reflex-fg-soft text-base">{stats.schedule_count ?? 0}</dd>
        </div>
        <div>
          <dt className="text-reflex-fg-faint uppercase tracking-wider">Enabled</dt>
          <dd className="text-reflex-fg-soft text-base">{stats.enabled_count ?? 0}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-reflex-fg-faint uppercase tracking-wider">Next fire</dt>
          <dd className="text-reflex-fg-soft">{next}</dd>
        </div>
        {lastError && (
          <div className="col-span-2">
            <dt className="text-reflex-fg-faint uppercase tracking-wider">Last error</dt>
            <dd className="text-reflex-danger break-words">{lastError}</dd>
          </div>
        )}
      </dl>
    </Card>
  );
}
