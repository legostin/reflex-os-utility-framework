import { reflexInvoke } from "./invoke";
import { apps } from "./apps";
import type {
  ManifestAction,
  ManifestSchedule,
  ManifestWidget,
  SchedulerRun,
  SchedulerStats,
} from "./types";

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
  /**
   * @deprecated Use `apps.invoke` from `bridge/apps`. This method invokes
   * another app's public action — it does not mutate this app's actions, so
   * the name in the `actions` namespace is misleading. Kept here only for
   * backwards compatibility; new code should import from
   * `reflex-os-utility-framework/bridge` and call `apps.invoke(...)`.
   */
  invoke<T = unknown>(params: { app_id: string; action_id: string; params?: Record<string, unknown> }) {
    return apps.invoke<T>(params);
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
    return reflexInvoke<SchedulerRun[]>("scheduler.runs", params);
  },
  stats(params: { appId?: string; includeAll?: boolean; recentLimit?: number } = {}) {
    return reflexInvoke<SchedulerStats>("scheduler.stats", params);
  },
  runDetail(runId: string) {
    return reflexInvoke<SchedulerRun>("scheduler.runDetail", { runId });
  },
} as const;

export type ManifestClient = typeof manifest;
export type ActionsClient = typeof actions;
export type WidgetsClient = typeof widgets;
export type SchedulerClient = typeof scheduler;
