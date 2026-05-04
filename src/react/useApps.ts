import * as React from "react";
import { useBridge } from "./ReflexProvider";
import { useAsync } from "./useAsync";
import type {
  AppDiffResult,
  AppKind,
  AppServerLogEntry,
  AppServerStatus,
  AppStatus,
  AppSummary,
  AppTrashEntry,
} from "../bridge/types";

export function useApps(params: { includeTrash?: boolean; kind?: AppKind } = {}) {
  const bridge = useBridge();
  return useAsync<AppSummary[]>(
    () => bridge.apps.list(params),
    [params.includeTrash ?? false, params.kind ?? null],
  );
}

export function useApp(appId: string | undefined) {
  const bridge = useBridge();
  return useAsync<AppStatus | null>(
    () => (appId ? bridge.apps.status(appId) : Promise.resolve(null)),
    [appId ?? null],
  );
}

export function useAppActions(appId: string | undefined, includeSteps = false) {
  const bridge = useBridge();
  return useAsync(
    () =>
      appId
        ? bridge.apps.listActions({ app_id: appId, include_steps: includeSteps })
        : Promise.resolve([]),
    [appId ?? null, includeSteps],
  );
}

export function useAppDiff(appId: string | undefined) {
  const bridge = useBridge();
  return useAsync<AppDiffResult | null>(
    () => (appId ? bridge.apps.diff(appId) : Promise.resolve(null)),
    [appId ?? null],
  );
}

export interface UseAppServerOptions {
  /** Poll status every N ms while the app is running. 0 disables polling. */
  pollIntervalMs?: number;
  /** Optionally pull a tail of server logs alongside status. */
  withLogs?: boolean;
  logLimit?: number;
}

/**
 * Status + optional log tail for a server-runtime app. Includes a small
 * polling loop because `apps.server.status` does not push updates by default.
 */
export function useAppServer(appId: string | undefined, options: UseAppServerOptions = {}) {
  const { pollIntervalMs = 0, withLogs = false, logLimit = 50 } = options;
  const bridge = useBridge();
  const [state, setState] = React.useState<{
    status: AppServerStatus | null;
    logs: AppServerLogEntry[];
    error: unknown;
    loading: boolean;
  }>({ status: null, logs: [], error: null, loading: true });

  const reload = React.useCallback(async () => {
    if (!appId) {
      setState({ status: null, logs: [], error: null, loading: false });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const status = await bridge.apps.serverStatus(appId);
      let logs: AppServerLogEntry[] = [];
      if (withLogs) {
        const logResult = await bridge.apps.serverLogs({ app_id: appId, limit: logLimit });
        logs = logResult.entries;
      }
      setState({ status, logs, error: null, loading: false });
    } catch (error) {
      setState((prev) => ({ ...prev, error, loading: false }));
    }
  }, [appId, bridge, withLogs, logLimit]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  React.useEffect(() => {
    if (!pollIntervalMs || !appId) return undefined;
    const handle = setInterval(() => {
      void reload();
    }, pollIntervalMs);
    return () => clearInterval(handle);
  }, [pollIntervalMs, appId, reload]);

  const start = React.useCallback(async () => {
    if (!appId) return;
    await bridge.apps.serverStart(appId);
    await reload();
  }, [appId, bridge, reload]);

  const stop = React.useCallback(async () => {
    if (!appId) return;
    await bridge.apps.serverStop(appId);
    await reload();
  }, [appId, bridge, reload]);

  const restart = React.useCallback(async () => {
    if (!appId) return;
    await bridge.apps.serverRestart(appId);
    await reload();
  }, [appId, bridge, reload]);

  return { ...state, reload, start, stop, restart };
}

export function useAppsTrash() {
  const bridge = useBridge();
  return useAsync<AppTrashEntry[]>(() => bridge.apps.trashList(), []);
}
