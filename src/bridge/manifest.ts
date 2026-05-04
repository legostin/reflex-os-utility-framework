import { reflexInvoke } from "./invoke";
import type { ManifestAction, ManifestSchedule, ManifestWidget } from "./types";

export const manifest = {
  get() {
    return reflexInvoke<Record<string, unknown>>("manifest.get", {});
  },
  update(patch: Record<string, unknown>) {
    return reflexInvoke<{ ok: boolean }>("manifest.update", { patch });
  },
} as const;

export const actions = {
  list() {
    return reflexInvoke<ManifestAction[]>("actions.list", {});
  },
  upsert(action: ManifestAction | { action: ManifestAction }) {
    const params = "action" in action ? action : { action };
    return reflexInvoke<{ ok: boolean }>("actions.upsert", params);
  },
  delete(actionId: string) {
    return reflexInvoke<{ ok: boolean }>("actions.delete", { actionId });
  },
  invoke(params: { app_id: string; action_id: string; params?: Record<string, unknown> }) {
    return reflexInvoke<unknown>("apps.invoke", params);
  },
} as const;

export const widgets = {
  list() {
    return reflexInvoke<ManifestWidget[]>("widgets.list", {});
  },
  upsert(widget: ManifestWidget & { html?: string }) {
    return reflexInvoke<{ ok: boolean }>("widgets.upsert", widget);
  },
  delete(params: { widgetId: string; deleteEntry?: boolean }) {
    return reflexInvoke<{ ok: boolean }>("widgets.delete", params);
  },
} as const;

export const scheduler = {
  list(params: { appId?: string; includeAll?: boolean } = {}) {
    return reflexInvoke<ManifestSchedule[]>("scheduler.list", params);
  },
  upsert(schedule: ManifestSchedule | { schedule: ManifestSchedule }) {
    const params = "schedule" in schedule ? schedule : { schedule };
    return reflexInvoke<{ ok: boolean }>("scheduler.upsert", params);
  },
  delete(scheduleId: string) {
    return reflexInvoke<{ ok: boolean }>("scheduler.delete", { scheduleId });
  },
  runNow(scheduleId: string) {
    return reflexInvoke<{ ok: boolean; runId?: string }>("scheduler.runNow", { scheduleId });
  },
  setPaused(params: { scheduleId: string; paused: boolean }) {
    return reflexInvoke<{ ok: boolean }>("scheduler.setPaused", params);
  },
  runs(params: { limit?: number; beforeTs?: number; appId?: string; includeAll?: boolean } = {}) {
    return reflexInvoke<Array<Record<string, unknown>>>(
      "scheduler.runs",
      params,
    );
  },
  stats(params: { appId?: string; includeAll?: boolean; recentLimit?: number } = {}) {
    return reflexInvoke<Record<string, unknown>>(
      "scheduler.stats",
      params,
    );
  },
  runDetail(runId: string) {
    return reflexInvoke<Record<string, unknown>>("scheduler.runDetail", { runId });
  },
} as const;

export type ManifestClient = typeof manifest;
export type ActionsClient = typeof actions;
export type WidgetsClient = typeof widgets;
export type SchedulerClient = typeof scheduler;
