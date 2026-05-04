import * as React from "react";
import { useBridge } from "../../react/ReflexProvider";
import { useMcpServers } from "../../react/useMcp";
import type { McpServerConfig } from "../../bridge/types";
import { Badge } from "../primitives/Badge";
import { Button } from "../primitives/Button";
import { Card } from "../primitives/Card";
import { EmptyState } from "../primitives/EmptyState";
import { Field, Input, Textarea } from "../primitives/Field";
import { JsonView } from "../primitives/JsonView";
import { StatusLine, type StatusTone } from "../primitives/StatusLine";
import { Toolbar } from "../primitives/Toolbar";
import { cn } from "../cn";

export interface McpServerListProps {
  projectId?: string;
  includeAll?: boolean;
  className?: string;
  /** Hide the inline editor; just list servers. */
  readOnly?: boolean;
}

/**
 * Show project MCP servers and inline-edit/add new ones via
 * `project.mcp.upsert`. Raw config requires `mcp.read:<id>`/`mcp.read:*`
 * grant — the brick handles permission errors gracefully.
 */
export function McpServerList({
  projectId,
  includeAll,
  className,
  readOnly,
}: McpServerListProps) {
  const bridge = useBridge();
  const { data, loading, error, reload } = useMcpServers({
    ...(projectId !== undefined ? { projectId } : {}),
    ...(includeAll !== undefined ? { includeAll } : {}),
    includeConfig: !readOnly,
  });
  const [editing, setEditing] = React.useState<{ projectId: string; name: string } | null>(null);
  const [draft, setDraft] = React.useState("");
  const [status, setStatus] = React.useState<{ message: string; tone: StatusTone } | null>(null);

  function startEdit(target: string, name: string, config: McpServerConfig | undefined) {
    setEditing({ projectId: target, name });
    setDraft(JSON.stringify(config ?? { command: "" }, null, 2));
    setStatus(null);
  }

  async function saveEdit() {
    if (!editing) return;
    let config: McpServerConfig;
    try {
      config = JSON.parse(draft) as McpServerConfig;
    } catch (err) {
      setStatus({ message: `Invalid JSON: ${(err as Error).message}`, tone: "danger" });
      return;
    }
    try {
      await bridge.mcp.upsert({ projectId: editing.projectId, name: editing.name, config });
      setStatus({ message: `Saved “${editing.name}”.`, tone: "ok" });
      setEditing(null);
      await reload();
    } catch (err) {
      setStatus({
        message: err instanceof Error ? err.message : String(err),
        tone: "danger",
      });
    }
  }

  async function remove(target: string, name: string) {
    if (!confirm(`Remove MCP server “${name}”?`)) return;
    try {
      await bridge.mcp.delete({ projectId: target, name });
      setStatus({ message: `Removed “${name}”.`, tone: "ok" });
      await reload();
    } catch (err) {
      setStatus({
        message: err instanceof Error ? err.message : String(err),
        tone: "danger",
      });
    }
  }

  if (loading && !data) {
    return <div className={cn("text-xs text-reflex-fg-muted", className)}>Loading MCP servers…</div>;
  }

  if (error) {
    return <div className={cn("text-xs text-reflex-danger", className)}>{String(error)}</div>;
  }

  const rows = data ?? [];
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No projects"
        description="Link a project to manage MCP servers."
        className={className}
      />
    );
  }

  return (
    <div className={cn("grid gap-3", className)}>
      {rows.map((row) => (
        <Card key={row.project_id} className="grid gap-2">
          <header className="flex items-baseline gap-2 justify-between">
            <div className="grid gap-0.5">
              <h3 className="text-sm font-medium">{row.project_name ?? row.project_id}</h3>
              <span className="text-xxs text-reflex-fg-faint font-mono">{row.project_id}</span>
            </div>
            <Badge tone="info">{row.server_names.length} servers</Badge>
          </header>
          {row.server_names.length === 0 ? (
            <p className="text-xs text-reflex-fg-muted">No MCP servers configured.</p>
          ) : (
            <ul className="grid gap-1.5">
              {row.server_names.map((name) => (
                <li
                  key={name}
                  className="flex items-start gap-2 justify-between p-2 rounded bg-reflex-surface-2 border border-reflex-border"
                >
                  <div className="grid gap-1 min-w-0 flex-1">
                    <span className="text-sm font-mono">{name}</span>
                    {row.servers?.[name] && (
                      <JsonView value={row.servers[name]} defaultDepth={1} className="max-h-44" />
                    )}
                  </div>
                  {!readOnly && (
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(row.project_id, name, row.servers?.[name])}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => void remove(row.project_id, name)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          {!readOnly && editing?.projectId !== row.project_id && (
            <Button
              size="sm"
              variant="subtle"
              onClick={() => startEdit(row.project_id, "", { command: "", args: [] })}
            >
              Add server…
            </Button>
          )}
          {!readOnly && editing?.projectId === row.project_id && (
            <Card className="grid gap-2 bg-reflex-surface-2">
              <Field label="Server name">
                <Input
                  value={editing.name}
                  onChange={(event) =>
                    setEditing((prev) => (prev ? { ...prev, name: event.target.value } : prev))
                  }
                  placeholder="my-mcp"
                />
              </Field>
              <Field label="Config (JSON)">
                <Textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={8}
                  spellCheck={false}
                  className="font-mono text-xs"
                />
              </Field>
              <Toolbar>
                <Button
                  variant="primary"
                  onClick={() => void saveEdit()}
                  disabled={!editing.name.trim()}
                >
                  Save
                </Button>
                <Button variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </Toolbar>
            </Card>
          )}
        </Card>
      ))}
      {status && <StatusLine tone={status.tone}>{status.message}</StatusLine>}
    </div>
  );
}
