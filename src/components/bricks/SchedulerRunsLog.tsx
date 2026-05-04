import * as React from "react";
import { useSchedulerRuns } from "../../react/useScheduler";
import type { SchedulerRun } from "../../bridge/types";
import { Badge } from "../primitives/Badge";
import { Button } from "../primitives/Button";
import { DataTable, type DataTableColumn } from "../primitives/DataTable";
import { JsonView } from "../primitives/JsonView";
import { cn } from "../cn";

export interface SchedulerRunsLogProps {
  limit?: number;
  appId?: string;
  includeAll?: boolean;
  className?: string;
}

const STATUS_TONE: Record<string, "ok" | "warn" | "danger" | "info"> = {
  ok: "ok",
  running: "info",
  error: "danger",
};

/**
 * Recent scheduler runs in a tabular log. Click a row to expand the result
 * payload via {@link JsonView}.
 */
export function SchedulerRunsLog({
  limit = 25,
  appId,
  includeAll,
  className,
}: SchedulerRunsLogProps) {
  const params: { limit: number; appId?: string; includeAll?: boolean } = { limit };
  if (appId !== undefined) params.appId = appId;
  if (includeAll !== undefined) params.includeAll = includeAll;

  const { data, loading, error, reload } = useSchedulerRuns(params);
  const [openRunId, setOpenRunId] = React.useState<string | null>(null);

  const columns: DataTableColumn<SchedulerRun>[] = [
    {
      id: "schedule_id",
      header: "Schedule",
      render: (row) => (
        <div className="grid gap-0.5">
          <span className="text-sm">{row.schedule_id}</span>
          {row.app_id && (
            <span className="text-xxs text-reflex-fg-faint font-mono">{row.app_id}</span>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      render: (row) => (
        <Badge tone={STATUS_TONE[row.status ?? "info"] ?? "neutral"}>{row.status ?? "—"}</Badge>
      ),
    },
    {
      id: "started",
      header: "Started",
      render: (row) =>
        row.started_at_ms ? new Date(row.started_at_ms).toLocaleString() : "—",
    },
    {
      id: "duration",
      header: "Duration",
      align: "right",
      render: (row) => {
        if (!row.started_at_ms || !row.finished_at_ms) return "—";
        const ms = row.finished_at_ms - row.started_at_ms;
        return `${(ms / 1000).toFixed(1)}s`;
      },
    },
  ];

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex justify-end">
        <Button size="sm" variant="ghost" onClick={() => void reload()}>
          Refresh
        </Button>
      </div>
      {loading && !data ? (
        <div className="text-xs text-reflex-fg-muted">Loading runs…</div>
      ) : error ? (
        <div className="text-xs text-reflex-danger">{String(error)}</div>
      ) : (
        <DataTable
          columns={columns}
          rows={data ?? []}
          rowKey={(row) => row.id}
          activeKey={openRunId}
          onRowClick={(row) => setOpenRunId((current) => (current === row.id ? null : row.id))}
          empty={<div className="text-xs text-reflex-fg-muted">No runs recorded.</div>}
        />
      )}
      {openRunId &&
        (() => {
          const run = (data ?? []).find((row) => row.id === openRunId);
          if (!run) return null;
          return (
            <JsonView value={run} defaultDepth={1} className="max-h-[40vh]" />
          );
        })()}
    </div>
  );
}
