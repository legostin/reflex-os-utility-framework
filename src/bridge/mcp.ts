import { reflexInvoke } from "./invoke";
import type { McpServerConfig, McpServerSummary } from "./types";

/**
 * MCP server client. Reading server names is available for linked projects;
 * raw config requires `mcp.read:<id>` or `mcp.read:*`. Mutations require
 * `mcp.write:<id>` or `mcp.write:*`.
 */
export const mcp = {
  servers(params: { projectId?: string; includeAll?: boolean; includeConfig?: boolean } = {}) {
    return reflexInvoke<McpServerSummary[]>("mcp.servers", params);
  },
  upsert(
    params:
      | { projectId?: string; name: string; config: McpServerConfig }
      | { projectId?: string; serverName: string; config: McpServerConfig },
  ) {
    return reflexInvoke<{
      ok: boolean;
      name: string;
      replaced?: boolean;
      server?: McpServerConfig;
      server_names: string[];
    }>("project.mcp.upsert", params);
  },
  delete(params: { projectId?: string; name?: string; names?: string[] }) {
    return reflexInvoke<{ ok: boolean; removed: string[]; server_names: string[] }>(
      "project.mcp.delete",
      params,
    );
  },
} as const;

export type McpClient = typeof mcp;
