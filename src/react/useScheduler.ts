import * as React from "react";
import { useBridge } from "./ReflexProvider";
import { useAsync } from "./useAsync";
import type {
  ManifestSchedule,
  SchedulerRun,
  SchedulerStats,
} from "../bridge/types";

export function useScheduler(params: { appId?: string; includeAll?: boolean } = {}) {
  const bridge = useBridge();
  const result = useAsync<ManifestSchedule[]>(
    () => bridge.scheduler.list(params),
    [params.appId ?? null, params.includeAll ?? false],
  );

  const upsert = React.useCallback(
    async (schedule: ManifestSchedule) => {
      const out = await bridge.scheduler.upsert(schedule);
      await result.reload();
      return out;
    },
    [bridge, result.reload],
  );

  const remove = React.useCallback(
    async (scheduleId: string) => {
      const out = await bridge.scheduler.delete(scheduleId);
      await result.reload();
      return out;
    },
    [bridge, result.reload],
  );

  const runNow = React.useCallback(
    async (scheduleId: string) => bridge.scheduler.runNow(scheduleId),
    [bridge],
  );

  const setPaused = React.useCallback(
    async (scheduleId: string, paused: boolean) => {
      const out = await bridge.scheduler.setPaused({ scheduleId, paused });
      await result.reload();
      return out;
    },
    [bridge, result.reload],
  );

  return { ...result, upsert, remove, runNow, setPaused };
}

export function useSchedulerRuns(params: {
  limit?: number;
  beforeTs?: number;
  appId?: string;
  includeAll?: boolean;
} = {}) {
  const bridge = useBridge();
  return useAsync<SchedulerRun[]>(
    () => bridge.scheduler.runs(params),
    [params.limit ?? null, params.beforeTs ?? null, params.appId ?? null, params.includeAll ?? false],
  );
}

export function useSchedulerStats(params: {
  appId?: string;
  includeAll?: boolean;
  recentLimit?: number;
} = {}) {
  const bridge = useBridge();
  return useAsync<SchedulerStats>(
    () => bridge.scheduler.stats(params),
    [params.appId ?? null, params.includeAll ?? false, params.recentLimit ?? null],
  );
}
