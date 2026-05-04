import * as React from "react";
import type { MemoryNote, MemoryScope } from "../../bridge/types";
import { useMemoryNotes } from "../../react/useMemoryNotes";
import { Badge } from "../primitives/Badge";
import { Button } from "../primitives/Button";
import { EmptyState } from "../primitives/EmptyState";
import { Card } from "../primitives/Card";
import { cn } from "../cn";

export interface MemoryNoteListProps {
  scope?: MemoryScope;
  projectId?: string;
  threadId?: string;
  /** Optional kind filter applied client-side after the bridge call. */
  kindFilter?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  onSelect?: (note: MemoryNote) => void;
  onDelete?: (note: MemoryNote) => void;
}

/**
 * High-level list of memory notes for the given scope. Pulls from `memory.list`,
 * surfaces tags, kind, and timestamps, and exposes optional select/delete
 * callbacks. Use the same component for project, global, or topic memory by
 * setting `scope`.
 */
export function MemoryNoteList({
  scope = "project",
  projectId,
  threadId,
  kindFilter,
  emptyTitle = "No memory yet",
  emptyDescription = "Save a note to see it appear here.",
  className,
  onSelect,
  onDelete,
}: MemoryNoteListProps) {
  const params: Parameters<typeof useMemoryNotes>[0] = { scope };
  if (projectId !== undefined) params.projectId = projectId;
  if (threadId !== undefined) params.threadId = threadId;
  const { data, loading, error, reload, remove } = useMemoryNotes(params);

  const notes = (data ?? []).filter((note) =>
    kindFilter ? note.kind === kindFilter : true,
  );

  if (loading && !data) {
    return (
      <div className={cn("text-xs text-reflex-fg-muted", className)}>Loading memory…</div>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-reflex-danger-border", className)}>
        <div className="text-xs text-reflex-danger">{String(error)}</div>
        <Button size="sm" variant="ghost" onClick={() => void reload()} className="mt-2">
          Retry
        </Button>
      </Card>
    );
  }

  if (notes.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} className={className} />;
  }

  return (
    <ul className={cn("grid gap-2", className)}>
      {notes.map((note, idx) => {
        const path = note.rel_path ?? note.relPath ?? note.path ?? note.name ?? String(idx);
        return (
          <li
            key={path + idx}
            className="bg-reflex-surface-2 border border-reflex-border rounded p-3 grid gap-2"
          >
            <div className="flex items-start gap-2 justify-between">
              <button
                type="button"
                className="text-left grid gap-0.5 min-w-0 flex-1"
                onClick={onSelect ? () => onSelect(note) : undefined}
                disabled={!onSelect}
              >
                <span className="text-sm font-medium text-reflex-fg truncate">
                  {note.name ?? path}
                </span>
                {(note.description || path) && (
                  <span className="text-xs text-reflex-fg-muted line-clamp-2">
                    {note.description ?? path}
                  </span>
                )}
              </button>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {note.kind && <Badge tone="info">{String(note.kind)}</Badge>}
                {onDelete && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={async () => {
                      onDelete(note);
                      if (path) await remove(path);
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {note.tags.map((tag) => (
                  <Badge key={tag} tone="neutral">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
