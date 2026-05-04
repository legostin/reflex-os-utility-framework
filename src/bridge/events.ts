import { reflexInvoke } from "./invoke";
import type { ReflexEvent } from "./types";

declare global {
  interface Window {
    reflexEventOn?: (topic: string, handler: (event: ReflexEvent) => void) => void;
    reflexEventOff?: (topic: string) => void;
    reflexEventEmit?: (topic: string, payload: unknown) => Promise<{ ok: boolean }>;
    reflexEventRecent?: (
      topicOrParams?: string | { topic?: string; limit?: number },
      limit?: number,
    ) => Promise<ReflexEvent[]>;
    reflexEventSubscriptions?: () => Promise<{ topics: string[] }>;
    reflexEventClearSubscriptions?: () => Promise<{ ok: boolean }>;
  }
}

/**
 * Topic API. Reflex topics carry both inter-app pubsub (`events.*`) and
 * agent-thread topics (`topics.*`). This module is the inter-app pubsub side —
 * for thread topics see `./topics.ts`.
 *
 * Subscription is a two-step affair: the host has to know which topics this
 * iframe wants (so the parent can route incoming messages back), and we keep
 * a local handler registry so multiple components can listen to the same
 * topic without re-subscribing.
 */
const handlers = new Map<string, Set<(event: ReflexEvent) => void>>();
let messageBound = false;

function bindMessageBus() {
  if (messageBound || typeof window === "undefined") return;
  messageBound = true;
  window.addEventListener("message", (event: MessageEvent) => {
    const data = event.data as
      | { source?: string; type?: string; topic?: string; payload?: unknown; ts_ms?: number }
      | undefined;
    if (!data || data.source !== "reflex" || data.type !== "event" || !data.topic) return;
    const set = handlers.get(data.topic);
    if (!set) return;
    const payload: ReflexEvent = {
      topic: data.topic,
      payload: data.payload,
      ts_ms: data.ts_ms,
    };
    set.forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        console.warn("[reflex-os-utility-framework] event handler threw", error);
      }
    });
  });
}

async function ensureSubscription(topic: string) {
  if (typeof window !== "undefined" && typeof window.reflexEventOn === "function") {
    window.reflexEventOn(topic, (event) => {
      const set = handlers.get(topic);
      set?.forEach((handler) => handler(event));
    });
    return;
  }
  await reflexInvoke("events.subscribe", { topics: [topic] });
}

export const events = {
  async subscribe(topic: string, handler: (event: ReflexEvent) => void) {
    bindMessageBus();
    let set = handlers.get(topic);
    if (!set) {
      set = new Set();
      handlers.set(topic, set);
      await ensureSubscription(topic);
    }
    set.add(handler);
    return () => {
      const current = handlers.get(topic);
      if (!current) return;
      current.delete(handler);
      if (current.size === 0) {
        handlers.delete(topic);
        if (typeof window !== "undefined" && typeof window.reflexEventOff === "function") {
          window.reflexEventOff(topic);
        } else {
          reflexInvoke("events.unsubscribe", { topics: [topic] }).catch(() => {});
        }
      }
    };
  },
  async unsubscribeAll() {
    handlers.clear();
    if (typeof window !== "undefined" && typeof window.reflexEventClearSubscriptions === "function") {
      return window.reflexEventClearSubscriptions();
    }
    return reflexInvoke<{ ok: boolean }>("events.clearSubscriptions", {});
  },
  emit<T = unknown>(topic: string, payload: T) {
    return reflexInvoke<{ ok: boolean }>("events.emit", { topic, payload });
  },
  recent<T = unknown>(params: { topic?: string; limit?: number } = {}) {
    return reflexInvoke<Array<ReflexEvent<T>>>("events.recent", params);
  },
  subscriptions() {
    return reflexInvoke<{ topics: string[] }>("events.subscriptions", {});
  },
} as const;

export type EventsClient = typeof events;
