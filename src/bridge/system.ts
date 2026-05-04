import { reflexInvoke } from "./invoke";
import type { LogEntry, SystemContext } from "./types";

export type ReflexPanel = "apps" | "memory" | "automations" | "browser" | "settings";

export const system = {
  context() {
    return reflexInvoke<SystemContext>("system.context", {});
  },
  capabilities() {
    return reflexInvoke<Record<string, unknown>>("system.capabilities", {});
  },
  bridgeCatalog() {
    return reflexInvoke<{
      methods: string[];
      helpers: string[];
      grants?: string[];
    }>("bridge.catalog", {});
  },
  openPanel(params: { panel: ReflexPanel; projectId?: string; threadId?: string }) {
    return reflexInvoke<{ ok: boolean }>("system.openPanel", params);
  },
  openUrl(url: string) {
    return reflexInvoke<{ ok: boolean }>("system.openUrl", { url });
  },
  openPath(path: string) {
    return reflexInvoke<{ ok: boolean }>("system.openPath", { path });
  },
  revealPath(path: string) {
    return reflexInvoke<{ ok: boolean }>("system.revealPath", { path });
  },
  notify(params: { title: string; body?: string }) {
    return reflexInvoke<{ ok: boolean }>("notify.show", params);
  },
  log(params: { level?: "info" | "warn" | "error" | "debug"; source?: string; message: string }) {
    return reflexInvoke<{ ok: boolean }>("logs.write", params);
  },
  logList(params: { limit?: number; sinceSeq?: number; source?: string; level?: string } = {}) {
    return reflexInvoke<{ entries: LogEntry[] }>("logs.list", params);
  },
  clipboardRead() {
    return reflexInvoke<{ text: string }>("clipboard.readText", {});
  },
  clipboardWrite(text: string) {
    return reflexInvoke<{ ok: boolean }>("clipboard.writeText", { text });
  },
} as const;

export type SystemClient = typeof system;
