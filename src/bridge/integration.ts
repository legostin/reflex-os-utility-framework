import { reflexInvoke } from "./invoke";
import type {
  IntegrationCatalogEntry,
  IntegrationMcpResult,
  IntegrationMcpStatus,
  IntegrationProfile,
} from "./types";

/**
 * Connected-app (integration) client. Wraps the six `integration.*` bridge
 * methods. Most utilities only need `profile()` + `learnVisible()` +
 * `mcpQuery()`; `catalog()` and `mcpStatus()` are configuration helpers.
 */
export const integration = {
  catalog(params: { provider?: string } = {}) {
    return reflexInvoke<IntegrationCatalogEntry[]>("integration.catalog", params);
  },
  profile() {
    return reflexInvoke<IntegrationProfile>("integration.profile", {});
  },
  update(
    params:
      | { integration?: Record<string, unknown>; external?: Record<string, unknown> }
      | { patch: Record<string, unknown> },
  ) {
    return reflexInvoke<{ ok: boolean; profile: IntegrationProfile }>(
      "integration.update",
      params,
    );
  },
  learnVisible(params: {
    tabId?: string;
    serviceUrl?: string;
    visibleText?: string;
    outline?: unknown;
  } = {}) {
    return reflexInvoke<{
      ok: boolean;
      profile: Record<string, unknown>;
      saved: boolean;
    }>("integration.learnVisible", params);
  },
  mcpStatus(params: {
    provider?: string;
    serverName?: string;
    includeConfig?: boolean;
  } = {}) {
    return reflexInvoke<IntegrationMcpStatus[]>("integration.mcpStatus", params);
  },
  mcpQuery(params: { query: string; serviceUrl?: string }) {
    return reflexInvoke<IntegrationMcpResult>("integration.mcpQuery", params);
  },
} as const;

export type IntegrationClient = typeof integration;
