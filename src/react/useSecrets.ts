import * as React from "react";
import { useBridge } from "./ReflexProvider";
import { useAsync } from "./useAsync";
import type {
  SecretMetadata,
  SecretScope,
  SecretValue,
} from "../bridge/secrets";

export interface UseSecretsOptions {
  scope?: SecretScope;
  projectId?: string;
  /** Skip the initial fetch until set true (e.g. waiting on a project pick). */
  enabled?: boolean;
}

/**
 * List + mutate secrets in a single scope. Mirrors `useMemoryNotes` ergonomics
 * — `data` holds metadata only (values stay on the host until the user
 * explicitly fetches one).
 */
export function useSecrets(params: UseSecretsOptions = {}) {
  const bridge = useBridge();
  const { enabled = true, scope, projectId } = params;
  const result = useAsync<SecretMetadata[]>(
    async () => {
      if (!enabled) return [];
      const out = await bridge.secrets.list({
        ...(scope ? { scope } : {}),
        ...(projectId ? { projectId } : {}),
      });
      return out.entries;
    },
    [enabled, scope ?? null, projectId ?? null],
  );

  const get = React.useCallback(
    (key: string) =>
      bridge.secrets.get({
        scope: scope ?? "project",
        key,
        ...(projectId ? { projectId } : {}),
      }),
    [bridge, scope, projectId],
  );

  const set = React.useCallback(
    async (key: string, value: string) => {
      const out = await bridge.secrets.set({
        scope: scope ?? "project",
        key,
        value,
        ...(projectId ? { projectId } : {}),
      });
      await result.reload();
      return out;
    },
    [bridge, scope, projectId, result.reload],
  );

  const remove = React.useCallback(
    async (key: string) => {
      const out = await bridge.secrets.delete({
        scope: scope ?? "project",
        key,
        ...(projectId ? { projectId } : {}),
      });
      await result.reload();
      return out;
    },
    [bridge, scope, projectId, result.reload],
  );

  return { ...result, get, set, remove };
}

export interface UseSecretValueOptions {
  /** Resolve order override. Defaults to the host cascade. */
  projectId?: string;
  /** Skip the lookup until set to true. */
  enabled?: boolean;
}

export interface UseSecretValueResult {
  value: string | undefined;
  origin: SecretValue | null;
  found: boolean;
  loading: boolean;
  error: unknown;
  reload: () => Promise<void>;
}

/**
 * Resolve a single secret using the host cascade
 * `explicit projectId -> linked projects -> global`. The hook never caches
 * values across mounts — they live in component state and are refetched on
 * each mount or `reload()`. That keeps the DevTools surface minimal: a stale
 * tab won't keep a secret value alive after the user revokes it.
 */
export function useSecretValue(
  key: string | undefined,
  options: UseSecretValueOptions = {},
): UseSecretValueResult {
  const { projectId, enabled = true } = options;
  const bridge = useBridge();
  const [state, setState] = React.useState<{
    value: string | undefined;
    origin: SecretValue | null;
    found: boolean;
    loading: boolean;
    error: unknown;
  }>({ value: undefined, origin: null, found: false, loading: !!key && enabled, error: null });

  const reload = React.useCallback(async () => {
    if (!key || !enabled) {
      setState({ value: undefined, origin: null, found: false, loading: false, error: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await bridge.secrets.resolve({
        key,
        ...(projectId ? { projectId } : {}),
      });
      if ("found" in result && result.found === false) {
        setState({ value: undefined, origin: null, found: false, loading: false, error: null });
      } else {
        const found = result as SecretValue & { found: true };
        setState({
          value: found.value,
          origin: found,
          found: true,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      setState({ value: undefined, origin: null, found: false, loading: false, error });
    }
  }, [bridge, key, enabled, projectId]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  return { ...state, reload };
}

export function useSecretScopes() {
  const bridge = useBridge();
  return useAsync(() => bridge.secrets.scopes(), []);
}
