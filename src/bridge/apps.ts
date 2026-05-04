import { reflexInvoke } from "./invoke";
import type {
  AppDiffResult,
  AppKind,
  AppRuntime,
  AppServerLogEntry,
  AppServerStatus,
  AppStatus,
  AppSummary,
  AppTemplate,
  AppTrashEntry,
} from "./types";

/**
 * Apps client. Mirrors `apps.*` and `apps.server.*` bridge methods.
 *
 * The host accepts both camelCase and snake_case parameter names — we expose
 * the camelCase form documented in the Reflex README and let the caller use
 * the snake_case alias if they prefer.
 */
export const apps = {
  list(params: { includeTrash?: boolean; kind?: AppKind } = {}) {
    return reflexInvoke<AppSummary[]>("apps.list", params);
  },
  create(params: {
    description: string;
    template?: AppTemplate;
    projectId?: string;
    sourceRepoUrl?: string;
  }) {
    return reflexInvoke<{ ok: boolean; app_id: string; app: AppSummary }>(
      "apps.create",
      params,
    );
  },
  open(appId: string) {
    return reflexInvoke<{ ok: boolean }>("apps.open", { app_id: appId });
  },
  status(appId: string) {
    return reflexInvoke<AppStatus>("apps.status", { app_id: appId });
  },
  diff(appId: string) {
    return reflexInvoke<AppDiffResult>("apps.diff", { app_id: appId });
  },
  commit(params: { app_id: string; message?: string }) {
    return reflexInvoke<{ ok: boolean; revision?: number }>("apps.commit", params);
  },
  commitPartial(params: {
    app_id: string;
    /** Unified-diff patch limited to the files the caller wants to commit. */
    patch: string;
    message?: string;
  }) {
    return reflexInvoke<{ ok: boolean; revision?: number }>("apps.commitPartial", params);
  },
  revert(appId: string) {
    return reflexInvoke<{ ok: boolean }>("apps.revert", { app_id: appId });
  },
  delete(appId: string) {
    return reflexInvoke<{ ok: boolean; trash_id?: string }>("apps.delete", { app_id: appId });
  },
  trashList() {
    return reflexInvoke<AppTrashEntry[]>("apps.trashList", {});
  },
  restore(trashId: string) {
    return reflexInvoke<{ ok: boolean; app: AppSummary }>("apps.restore", { trash_id: trashId });
  },
  purge(trashId: string) {
    return reflexInvoke<{ ok: boolean }>("apps.purge", { trash_id: trashId });
  },
  // ---- import/export ----------------------------------------------------
  export(params: { app_id: string; targetPath: string }) {
    return reflexInvoke<{ ok: boolean; path: string }>("apps.export", params);
  },
  import(params: { zipPath: string }) {
    return reflexInvoke<{ ok: boolean; app: AppSummary }>("apps.import", params);
  },
  exportGithub(params: {
    app_id: string;
    repoUrl: string;
    branch?: string;
    subdir?: string;
    message?: string;
  }) {
    return reflexInvoke<{ ok: boolean; commit?: string; url?: string }>(
      "apps.exportGithub",
      params,
    );
  },
  importGithub(params: { repoUrl: string; branch?: string; subdir?: string }) {
    return reflexInvoke<{ ok: boolean; app: AppSummary }>("apps.importGithub", params);
  },
  /** Snake-case alias for {@link AppsClient.exportGithub}; the host accepts both. */
  export_github(params: {
    app_id: string;
    repoUrl: string;
    branch?: string;
    subdir?: string;
    message?: string;
  }) {
    return reflexInvoke<{ ok: boolean; commit?: string; url?: string }>(
      "apps.export_github",
      params,
    );
  },
  /** Snake-case alias for {@link AppsClient.importGithub}; the host accepts both. */
  import_github(params: { repoUrl: string; branch?: string; subdir?: string }) {
    return reflexInvoke<{ ok: boolean; app: AppSummary }>("apps.import_github", params);
  },
  // ---- server runtime ---------------------------------------------------
  serverStatus(appId: string) {
    return reflexInvoke<AppServerStatus>("apps.server.status", { app_id: appId });
  },
  serverLogs(params: { app_id: string; limit?: number; sinceTs?: number }) {
    return reflexInvoke<{ entries: AppServerLogEntry[] }>("apps.server.logs", params);
  },
  serverStart(appId: string) {
    return reflexInvoke<AppServerStatus>("apps.server.start", { app_id: appId });
  },
  serverStop(appId: string) {
    return reflexInvoke<AppServerStatus>("apps.server.stop", { app_id: appId });
  },
  serverRestart(appId: string) {
    return reflexInvoke<AppServerStatus>("apps.server.restart", { app_id: appId });
  },
  // ---- public action invocation ----------------------------------------
  invoke<T = unknown>(params: {
    app_id: string;
    action_id: string;
    params?: Record<string, unknown>;
  }) {
    return reflexInvoke<T>("apps.invoke", params);
  },
  listActions(params: { app_id?: string; include_steps?: boolean } = {}) {
    return reflexInvoke<
      Array<{
        app_id: string;
        action_id: string;
        name?: string;
        description?: string;
        public?: boolean;
        params_schema?: unknown;
        steps?: unknown[];
      }>
    >("apps.list_actions", params);
  },
} as const;

export type AppsClient = typeof apps;
export type { AppRuntime, AppKind };
