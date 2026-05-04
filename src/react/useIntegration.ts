import { useBridge } from "./ReflexProvider";
import { useAsync } from "./useAsync";
import type {
  IntegrationCatalogEntry,
  IntegrationMcpStatus,
  IntegrationProfile,
} from "../bridge/types";

export function useIntegrationProfile() {
  const bridge = useBridge();
  return useAsync<IntegrationProfile>(() => bridge.integration.profile(), []);
}

export function useIntegrationCatalog(provider?: string) {
  const bridge = useBridge();
  return useAsync<IntegrationCatalogEntry[]>(
    () => bridge.integration.catalog(provider ? { provider } : {}),
    [provider ?? null],
  );
}

export function useIntegrationMcpStatus(params: {
  provider?: string;
  serverName?: string;
  includeConfig?: boolean;
} = {}) {
  const bridge = useBridge();
  return useAsync<IntegrationMcpStatus[]>(
    () => bridge.integration.mcpStatus(params),
    [params.provider ?? null, params.serverName ?? null, params.includeConfig ?? false],
  );
}
