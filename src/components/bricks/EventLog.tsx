import * as React from "react";
import { useEventLog } from "../../react/useEvent";
import { Badge } from "../primitives/Badge";
import { EmptyState } from "../primitives/EmptyState";
import { cn } from "../cn";

export interface EventLogProps<T = unknown> {
  topic: string;
  limit?: number;
  className?: string;
  renderPayload?: (payload: T) => React.ReactNode;
}

export function EventLog<T = unknown>({
  topic,
  limit = 25,
  className,
  renderPayload,
}: EventLogProps<T>) {
  const events = useEventLog<T>(topic, { limit });

  if (events.length === 0) {
    return (
      <EmptyState
        title={`Topic: ${topic}`}
        description="No events received yet. Emit one with events.emit() or wait for upstream activity."
        className={className}
      />
    );
  }

  return (
    <ul className={cn("grid gap-2 font-mono text-xs", className)}>
      {events.map((event, idx) => (
        <li
          key={(event.ts_ms ?? 0) + ":" + idx}
          className="bg-reflex-surface-2 border border-reflex-border rounded p-2 grid gap-1"
        >
          <div className="flex items-center gap-2">
            <Badge tone="info">{event.topic}</Badge>
            {event.ts_ms && (
              <span className="text-reflex-fg-faint">
                {new Date(event.ts_ms).toLocaleTimeString()}
              </span>
            )}
          </div>
          <pre className="whitespace-pre-wrap break-words text-reflex-fg-soft">
            {renderPayload
              ? renderPayload(event.payload as T)
              : JSON.stringify(event.payload, null, 2)}
          </pre>
        </li>
      ))}
    </ul>
  );
}
