import * as React from "react";
import { useBridge } from "./ReflexProvider";
import { useAsync } from "./useAsync";
import type { FsEntry } from "../bridge/fs";

export function useFs(params: { path?: string; recursive?: boolean; includeHidden?: boolean } = {}) {
  const bridge = useBridge();
  const result = useAsync(
    () => bridge.fs.list(params),
    [params.path ?? null, params.recursive ?? false, params.includeHidden ?? false],
  );
  const read = React.useCallback((path: string) => bridge.fs.read(path), [bridge]);
  const write = React.useCallback(
    (path: string, content: string) => bridge.fs.write(path, content),
    [bridge],
  );
  const remove = React.useCallback(
    async (path: string, opts: { recursive?: boolean } = {}) => {
      const out = await bridge.fs.delete({ path, ...opts });
      await result.reload();
      return out;
    },
    [bridge, result.reload],
  );
  return { ...result, read, write, remove };
}

export function useProjectFiles(params: {
  projectId?: string;
  path?: string;
  recursive?: boolean;
  includeHidden?: boolean;
} = {}) {
  const bridge = useBridge();
  const result = useAsync<{ entries: FsEntry[] } | { project_id: string; entries: FsEntry[] } | null>(
    () => bridge.projectFiles.list(params),
    [
      params.projectId ?? null,
      params.path ?? null,
      params.recursive ?? false,
      params.includeHidden ?? false,
    ],
  );

  const search = React.useCallback(
    (input: {
      projectId?: string;
      query: string;
      path?: string;
      recursive?: boolean;
      includeHidden?: boolean;
      includeContent?: boolean;
      limit?: number;
    }) =>
      bridge.projectFiles.search({
        ...(params.projectId ? { projectId: params.projectId } : {}),
        ...input,
      }),
    [bridge, params.projectId],
  );

  return { ...result, search, api: bridge.projectFiles };
}
