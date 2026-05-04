import * as React from "react";
import { events } from "../bridge/events";
import type { ReflexEvent } from "../bridge/types";

/**
 * Subscribe to a single Reflex event topic. The handler is captured in a ref
 * so consumers can pass a fresh closure each render without re-subscribing.
 */
export function useEvent<T = unknown>(
  topic: string | undefined,
  handler: (event: ReflexEvent<T>) => void,
) {
  const handlerRef = React.useRef(handler);
  handlerRef.current = handler;

  React.useEffect(() => {
    if (!topic) return undefined;
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    void events
      .subscribe(topic, (event) => {
        handlerRef.current(event as ReflexEvent<T>);
      })
      .then((cancel) => {
        if (cancelled) {
          cancel();
        } else {
          unsubscribe = cancel;
        }
      });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [topic]);
}

/**
 * Maintain a small ring buffer of the latest events on a topic. Useful for
 * dashboards/log views.
 */
export function useEventLog<T = unknown>(
  topic: string | undefined,
  options: { limit?: number; loadRecent?: boolean } = {},
) {
  const { limit = 50, loadRecent = true } = options;
  const [items, setItems] = React.useState<Array<ReflexEvent<T>>>([]);

  React.useEffect(() => {
    if (!topic || !loadRecent) return;
    let cancelled = false;
    void events.recent<T>({ topic, limit }).then((recent) => {
      if (cancelled) return;
      setItems(recent ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [topic, limit, loadRecent]);

  useEvent<T>(topic, (event) => {
    setItems((prev) => {
      const next = [event, ...prev];
      return next.slice(0, limit);
    });
  });

  return items;
}
