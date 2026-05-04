import { reflexInvoke } from "./invoke";
import type { PermissionRequestSummary } from "./types";

export const permissions = {
  list() {
    return reflexInvoke<{ permissions: string[]; hosts?: string[] }>("permissions.list", {});
  },
  requests() {
    return reflexInvoke<PermissionRequestSummary[]>("permissions.requests", {});
  },
  request(params: {
    permissions?: string[];
    hosts?: string[];
    reason?: string;
    serverListen?: boolean;
  }) {
    return reflexInvoke<{ ok: boolean; requestId?: string }>(
      "permissions.request",
      params,
    );
  },
  ensure(params: { permission?: string; permissions?: string[] }) {
    return reflexInvoke<{ ok: boolean; granted?: string[] }>(
      "permissions.ensure",
      params,
    );
  },
  revoke(params: { permission?: string; permissions?: string[] }) {
    return reflexInvoke<{ ok: boolean; removed?: string[] }>(
      "permissions.revoke",
      params,
    );
  },
} as const;

export const network = {
  hosts() {
    return reflexInvoke<{ hosts: string[] }>("network.hosts", {});
  },
  allowHost(params: { host?: string; hosts?: string[] }) {
    return reflexInvoke<{ ok: boolean }>("network.allowHost", params);
  },
  revokeHost(params: { host?: string; hosts?: string[] }) {
    return reflexInvoke<{ ok: boolean }>("network.revokeHost", params);
  },
  fetch(params: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
    timeoutMs?: number;
  }) {
    return reflexInvoke<{ status: number; headers: Record<string, string>; body: string }>(
      "net.fetch",
      params,
    );
  },
} as const;

export type PermissionsClient = typeof permissions;
export type NetworkClient = typeof network;
