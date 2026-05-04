import * as React from "react";
import { useApps } from "../../react/useApps";
import { useBridge } from "../../react/ReflexProvider";
import type { AppKind, AppSummary } from "../../bridge/types";
import { Badge } from "../primitives/Badge";
import { Button } from "../primitives/Button";
import { DataTable, type DataTableColumn } from "../primitives/DataTable";
import { EmptyState } from "../primitives/EmptyState";
import { cn } from "../cn";

export interface AppsListProps {
  kind?: AppKind;
  includeTrash?: boolean;
  className?: string;
  /** Notified when a row is clicked. */
  onSelect?: (app: AppSummary) => void;
  /** Show inline open/delete buttons per row. */
  enableActions?: boolean;
}

/**
 * Tabular list of installed apps with kind/runtime badges and inline open
 * + delete actions. Powers the "apps overview" surface used by the host's
 * built-in apps panel.
 */
export function AppsList({
  kind,
  includeTrash,
  className,
  onSelect,
  enableActions = true,
}: AppsListProps) {
  const bridge = useBridge();
  const params: { kind?: AppKind; includeTrash?: boolean } = {};
  if (kind !== undefined) params.kind = kind;
  if (includeTrash !== undefined) params.includeTrash = includeTrash;
  const { data, loading, error, reload } = useApps(params);

  if (loading && !data) {
    return <div className={cn("text-xs text-reflex-fg-muted", className)}>Loading apps…</div>;
  }
  if (error) {
    return <div className={cn("text-xs text-reflex-danger", className)}>{String(error)}</div>;
  }

  const rows = data ?? [];
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No apps yet"
        description="Generated utilities will appear here."
        className={className}
      />
    );
  }

  const columns: DataTableColumn<AppSummary>[] = [
    {
      id: "name",
      header: "App",
      render: (row) => (
        <div className="flex items-center gap-2 min-w-0">
          {row.icon && (
            <span className="text-xs font-mono px-1.5 py-0.5 bg-reflex-surface-3 border border-reflex-border rounded-sm">
              {row.icon}
            </span>
          )}
          <div className="grid gap-0.5 min-w-0">
            <span className="text-sm font-medium truncate">{row.name ?? row.id}</span>
            <span className="text-xxs text-reflex-fg-faint font-mono truncate">{row.id}</span>
          </div>
        </div>
      ),
    },
    {
      id: "kind",
      header: "Kind",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.kind && <Badge tone="info">{row.kind}</Badge>}
          {row.runtime && row.runtime !== row.kind && <Badge tone="neutral">{row.runtime}</Badge>}
          {row.dirty && <Badge tone="warn">dirty</Badge>}
        </div>
      ),
    },
    {
      id: "revision",
      header: "Rev",
      align: "right",
      render: (row) => row.revision ?? "—",
    },
  ];

  if (enableActions) {
    columns.push({
      id: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex gap-1 justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation();
              void bridge.apps.open(row.id);
            }}
          >
            Open
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={async (event) => {
              event.stopPropagation();
              if (!confirm(`Move “${row.name ?? row.id}” to trash?`)) return;
              await bridge.apps.delete(row.id);
              await reload();
            }}
          >
            Delete
          </Button>
        </div>
      ),
    });
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex items-center gap-2 justify-between">
        <span className="text-xs text-reflex-fg-muted">{rows.length} apps</span>
        <Button size="sm" variant="ghost" onClick={() => void reload()}>
          Refresh
        </Button>
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        onRowClick={onSelect}
      />
    </div>
  );
}
