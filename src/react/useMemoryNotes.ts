import * as React from "react";
import { useBridge } from "./ReflexProvider";
import { useAsync } from "./useAsync";
import type {
  MemoryListParams,
  MemoryNote,
  MemorySaveParams,
  MemorySearchParams,
} from "../bridge/types";

export interface UseMemoryNotesOptions extends MemoryListParams {
  /** Skip loading until set to true. Useful while waiting for a project id. */
  enabled?: boolean;
}

export function useMemoryNotes(params: UseMemoryNotesOptions = {}) {
  const bridge = useBridge();
  const { enabled = true, ...listParams } = params;
  const key = JSON.stringify(listParams);

  const result = useAsync<MemoryNote[]>(
    async () => (enabled ? bridge.memory.list(listParams) : []),
    [enabled, key],
  );

  const save = React.useCallback(
    async (saveParams: MemorySaveParams) => {
      const out = await bridge.memory.save(saveParams);
      await result.reload();
      return out;
    },
    [bridge, result.reload],
  );

  const remove = React.useCallback(
    async (relPath: string) => {
      const scope = listParams.scope;
      const out = await bridge.memory.delete({
        relPath,
        ...(scope ? { scope } : {}),
        ...(listParams.projectId ? { projectId: listParams.projectId } : {}),
      });
      await result.reload();
      return out;
    },
    [bridge, listParams.scope, listParams.projectId, result.reload],
  );

  return { ...result, save, remove };
}

export function useMemorySearch(initial: MemorySearchParams) {
  const bridge = useBridge();
  const [params, setParams] = React.useState(initial);
  const result = useAsync(() => bridge.memory.search(params), [JSON.stringify(params)]);
  return { ...result, params, setParams };
}

export function useMemoryRecall(query: string, projectId?: string) {
  const bridge = useBridge();
  return useAsync(
    () => (query.trim() ? bridge.memory.recall({ query, projectId }) : Promise.resolve(null)),
    [query, projectId ?? null],
  );
}
