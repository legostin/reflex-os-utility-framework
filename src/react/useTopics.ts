import { useBridge } from "./ReflexProvider";
import { useAsync } from "./useAsync";

export function useTopics(params: { projectId?: string; limit?: number; includeAll?: boolean } = {}) {
  const bridge = useBridge();
  return useAsync(
    () => bridge.topics.list(params),
    [params.projectId ?? null, params.limit ?? null, params.includeAll ?? false],
  );
}
