import { reflexInvoke } from "./invoke";

export type SecretScope = "global" | "project";

export interface SecretMetadata {
  key: string;
  scope: SecretScope;
  project_id?: string;
  updated_at_ms: number;
  source_app_id?: string;
}

export interface SecretValue extends SecretMetadata {
  value: string;
}

export interface SecretsScopeDescriptor {
  scope: SecretScope;
  projects?: Array<{ id: string; name: string }>;
}

/**
 * Secrets client. Two scopes:
 *
 *   - `global`  — one shared store, requires `secrets.global.read` /
 *                 `secrets.global.write` (or `secrets:*`).
 *   - `project` — one store per Reflex project. Linked-project reads work
 *                 without an explicit grant; foreign projects need
 *                 `secrets.read:<id>` / `secrets.write:<id>` (or wildcard
 *                 `secrets.read:*` / `secrets.write:*`).
 *
 * Values are encrypted at rest with AES-GCM; the master key lives in macOS
 * Keychain. Values never appear in `logs.list` — only `[<app>] <action>
 * <scope>:<project>/<key>` audit lines.
 *
 * Most utilities should call {@link SecretsClient.resolve} rather than
 * `get`. `resolve` walks the cascade
 * `explicit projectId → linked projects → global` and returns the first
 * match — the standard "pick up the right secret based on which project the
 * utility is open in" flow.
 */
export const secrets = {
  list(params: { scope?: SecretScope; projectId?: string } = {}) {
    return reflexInvoke<{ entries: SecretMetadata[] }>("secrets.list", params);
  },
  get(params: { scope: SecretScope; key: string; projectId?: string }) {
    return reflexInvoke<SecretValue>("secrets.get", params);
  },
  has(params: { scope: SecretScope; key: string; projectId?: string }) {
    return reflexInvoke<{ key: string; scope: SecretScope; project_id?: string; exists: boolean }>(
      "secrets.has",
      params,
    );
  },
  set(params: { scope: SecretScope; key: string; value: string; projectId?: string }) {
    return reflexInvoke<SecretMetadata>("secrets.set", params);
  },
  delete(params: { scope: SecretScope; key: string; projectId?: string }) {
    return reflexInvoke<{ ok: boolean; removed: boolean }>("secrets.delete", params);
  },
  resolve(params: { key: string; projectId?: string }) {
    return reflexInvoke<
      | (SecretValue & { found: true })
      | { found: false; key: string }
    >("secrets.resolve", params);
  },
  scopes() {
    return reflexInvoke<{ scopes: SecretsScopeDescriptor[] }>("secrets.scopes", {});
  },
} as const;

export type SecretsClient = typeof secrets;
