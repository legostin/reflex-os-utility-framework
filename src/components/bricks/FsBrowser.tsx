import * as React from "react";
import { useBridge } from "../../react/ReflexProvider";
import type { FsEntry } from "../../bridge/fs";
import { Badge } from "../primitives/Badge";
import { Button } from "../primitives/Button";
import { Card } from "../primitives/Card";
import { EmptyState } from "../primitives/EmptyState";
import { Field, Input } from "../primitives/Field";
import { Toolbar } from "../primitives/Toolbar";
import { cn } from "../cn";

export interface FsBrowserProps {
  /** Browse this app's folder (`fs.*`) or a project's folder. */
  scope?: "app" | "project";
  /** Required when scope is "project". */
  projectId?: string;
  /** Initial directory inside the chosen scope. Defaults to "". */
  initialPath?: string;
  className?: string;
  /** Notify when a file is opened (single-click on file row). */
  onSelectFile?: (entry: FsEntry, content: string) => void;
}

/**
 * Two-pane file browser: directory tree on the left, content preview on the
 * right. Wraps `fs.*` (scope = "app") or `project.files.*` (scope = "project").
 * Read-only by default — use the bridge directly for write/move/copy/delete.
 */
export function FsBrowser({
  scope = "app",
  projectId,
  initialPath = "",
  className,
  onSelectFile,
}: FsBrowserProps) {
  const bridge = useBridge();
  const [path, setPath] = React.useState(initialPath);
  const [entries, setEntries] = React.useState<FsEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown>(null);
  const [active, setActive] = React.useState<FsEntry | null>(null);
  const [activeContent, setActiveContent] = React.useState<string | null>(null);

  const reload = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (scope === "project") {
        const result = await bridge.projectFiles.list({
          ...(projectId ? { projectId } : {}),
          path,
        });
        setEntries(result.entries);
      } else {
        const result = await bridge.fs.list({ path });
        setEntries(result.entries);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [bridge, scope, projectId, path]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  async function openEntry(entry: FsEntry) {
    if (entry.kind === "directory") {
      setPath(entry.path);
      return;
    }
    setActive(entry);
    setActiveContent(null);
    try {
      let content: string;
      if (scope === "project") {
        const result = await bridge.projectFiles.read({
          ...(projectId ? { projectId } : {}),
          path: entry.path,
        });
        content = result.content;
      } else {
        const result = await bridge.fs.read(entry.path);
        content = result.content;
      }
      setActiveContent(content);
      onSelectFile?.(entry, content);
    } catch (err) {
      setActiveContent(`// failed to read: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  function navigateUp() {
    if (!path) return;
    const next = path.replace(/\/?[^/]+\/?$/, "");
    setPath(next);
  }

  return (
    <div className={cn("grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)]", className)}>
      <Card padded={false} className="overflow-hidden">
        <Toolbar className="px-3 py-2 border-b border-reflex-border">
          <Field label="Path" className="flex-1">
            <Input
              value={path}
              onChange={(event) => setPath(event.target.value)}
              placeholder="/"
            />
          </Field>
          <Button variant="ghost" onClick={navigateUp} className="self-end" disabled={!path}>
            ..
          </Button>
          <Button variant="subtle" onClick={() => void reload()} className="self-end">
            Reload
          </Button>
        </Toolbar>
        {loading && entries.length === 0 ? (
          <div className="px-3 py-3 text-xs text-reflex-fg-muted">Loading…</div>
        ) : error ? (
          <div className="px-3 py-3 text-xs text-reflex-danger">{String(error)}</div>
        ) : entries.length === 0 ? (
          <EmptyState title="Empty" description="No entries at this path." />
        ) : (
          <ul className="max-h-[420px] overflow-auto">
            {entries.map((entry) => (
              <li key={entry.path}>
                <button
                  type="button"
                  onClick={() => void openEntry(entry)}
                  className={cn(
                    "w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 border-b border-reflex-border last:border-b-0",
                    active?.path === entry.path
                      ? "bg-reflex-surface-3 text-reflex-fg"
                      : "hover:bg-reflex-surface-2 text-reflex-fg-soft",
                  )}
                >
                  <Badge tone={entry.kind === "directory" ? "info" : "neutral"}>
                    {entry.kind === "directory" ? "dir" : "file"}
                  </Badge>
                  <span className="truncate flex-1 font-mono">{entry.name}</span>
                  {entry.size !== undefined && (
                    <span className="text-reflex-fg-faint">{formatSize(entry.size)}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card>
        {active ? (
          <div className="grid gap-2">
            <header className="flex items-baseline gap-2 justify-between">
              <span className="text-xs font-mono break-all">{active.path}</span>
              {active.size !== undefined && (
                <span className="text-xxs text-reflex-fg-faint">{formatSize(active.size)}</span>
              )}
            </header>
            {activeContent === null ? (
              <p className="text-xs text-reflex-fg-muted">Reading…</p>
            ) : (
              <pre className="bg-reflex-bg border border-reflex-border rounded p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words max-h-[480px] overflow-auto">
                {activeContent}
              </pre>
            )}
          </div>
        ) : (
          <EmptyState title="No file" description="Click any file on the left to preview." />
        )}
      </Card>
    </div>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
