import * as React from "react";
import { useScheduler } from "../../react/useScheduler";
import { Badge } from "../primitives/Badge";
import { Button } from "../primitives/Button";
import { EmptyState } from "../primitives/EmptyState";
import { StatusLine, type StatusTone } from "../primitives/StatusLine";
import { DataTable, type DataTableColumn } from "../primitives/DataTable";
import type { ManifestSchedule } from "../../bridge/types";
import { cn } from "../cn";

export interface SchedulesListProps {
  appId?: string;
  includeAll?: boolean;
  className?: string;
  onEdit?: (schedule: ManifestSchedule) => void;
}

/**
 * Tabular view of the host's `scheduler.list`. Pause / run-now / delete are
 * inline; editing a schedule's steps is delegated to a parent via `onEdit`
 * because step editing is too utility-specific for a default UI.
 */
export function SchedulesList({ appId, includeAll, className, onEdit }: SchedulesListProps) {
  const params: { appId?: string; includeAll?: boolean } = {};
  if (appId !== undefined) params.appId = appId;
  if (includeAll !== undefined) params.includeAll = includeAll;

  const { data, loading, error, runNow, setPaused, remove } = useScheduler(params);
  const [status, setStatus] = React.useState<{ message: string; tone: StatusTone } | null>(null);

  if (loading && !data) {
    return <div className={cn("text-xs text-reflex-fg-muted", className)}>Loading schedules…</div>;
  }
  if (error) {
    return <div className={cn("text-xs text-reflex-danger", className)}>{String(error)}</div>;
  }

  const rows = data ?? [];
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No schedules"
        description="Define a schedule with scheduler.upsert() to see it appear here."
        className={className}
      />
    );
  }

  async function tryAct(label: string, action: () => Promise<unknown>) {
    setStatus(null);
    try {
      await action();
      setStatus({ message: `${label} ok.`, tone: "ok" });
    } catch (err) {
      setStatus({
        message: err instanceof Error ? err.message : String(err),
        tone: "danger",
      });
    }
  }

  const columns: DataTableColumn<ManifestSchedule>[] = [
    {
      id: "name",
      header: "Schedule",
      render: (row) => (
        <div className="grid gap-0.5">
          <span className="text-sm font-medium">{row.name ?? row.id}</span>
          <span className="text-xxs font-mono text-reflex-fg-faint">{row.id}</span>
        </div>
      ),
    },
    { id: "cron", header: "Cron", className: "font-mono text-xs", render: (row) => row.cron },
    {
      id: "enabled",
      header: "State",
      render: (row) => (
        <Badge tone={row.enabled === false ? "neutral" : "ok"}>
          {row.enabled === false ? "paused" : "active"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex gap-1 justify-end">
          <Button size="sm" variant="ghost" onClick={() => void tryAct("run", () => runNow(row.id))}>
            Run now
          </Button>
          <Button
            size="sm"
            variant="subtle"
            onClick={() => void tryAct("pause toggle", () => setPaused(row.id, !(row.enabled === false)))}
          >
            {row.enabled === false ? "Resume" : "Pause"}
          </Button>
          {onEdit && (
            <Button size="sm" variant="ghost" onClick={() => onEdit(row)}>
              Edit
            </Button>
          )}
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              if (!confirm(`Delete schedule “${row.name ?? row.id}”?`)) return;
              void tryAct("delete", () => remove(row.id));
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={cn("grid gap-2", className)}>
      <DataTable columns={columns} rows={rows} rowKey={(row) => row.id} />
      {status && <StatusLine tone={status.tone}>{status.message}</StatusLine>}
    </div>
  );
}
