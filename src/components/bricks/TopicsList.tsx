import * as React from "react";
import { useBridge } from "../../react/ReflexProvider";
import { useTopics } from "../../react/useTopics";
import { Button } from "../primitives/Button";
import { EmptyState } from "../primitives/EmptyState";
import { cn } from "../cn";

export interface TopicsListProps {
  projectId?: string;
  limit?: number;
  includeAll?: boolean;
  className?: string;
  /** Show an "Open topic" button per row (uses `topics.open`). */
  openable?: boolean;
}

export function TopicsList({
  projectId,
  limit,
  includeAll,
  className,
  openable = true,
}: TopicsListProps) {
  const bridge = useBridge();
  const params: Parameters<typeof useTopics>[0] = {};
  if (projectId !== undefined) params.projectId = projectId;
  if (limit !== undefined) params.limit = limit;
  if (includeAll !== undefined) params.includeAll = includeAll;

  const { data, loading, error } = useTopics(params);

  if (loading && !data) {
    return <div className={cn("text-xs text-reflex-fg-muted", className)}>Loading topics…</div>;
  }

  if (error) {
    return <div className={cn("text-xs text-reflex-danger", className)}>{String(error)}</div>;
  }

  const topics = data ?? [];
  if (topics.length === 0) {
    return (
      <EmptyState
        title="No topics"
        description="Topics created here will appear in this list."
        className={className}
      />
    );
  }

  return (
    <ul className={cn("grid gap-2", className)}>
      {topics.map((topic, idx) => {
        const threadId = topic.thread_id ?? topic.threadId ?? topic.id ?? String(idx);
        return (
          <li
            key={threadId}
            className="bg-reflex-surface-2 border border-reflex-border rounded p-3 flex items-center gap-3 justify-between"
          >
            <div className="grid gap-0.5 min-w-0 flex-1">
              <span className="text-sm font-medium truncate">
                {topic.title ?? "Untitled topic"}
              </span>
              <span className="text-xxs text-reflex-fg-faint truncate font-mono">
                {threadId}
              </span>
            </div>
            {openable && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  bridge.topics.open({
                    threadId,
                    ...(topic.project_id ?? topic.projectId
                      ? { projectId: topic.project_id ?? topic.projectId }
                      : {}),
                  })
                }
              >
                Open
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
