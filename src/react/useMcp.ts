import { useBridge } from "./ReflexProvider";
import { useAsync } from "./useAsync";
import type { McpServerSummary } from "../bridge/types";

export function useMcpServers(params: {
  projectId?: string;
  includeAll?: boolean;
  includeConfig?: boolean;
} = {}) {
  const bridge = useBridge();
  return useAsync<McpServerSummary[]>(
    () => bridge.mcp.servers(params),
    [params.projectId ?? null, params.includeAll ?? false, params.includeConfig ?? false],
  );
}
