import * as React from "react";
import { useBridge } from "./ReflexProvider";
import { useAsync } from "./useAsync";
import type {
  DialogOpenParams,
  DialogPathResult,
  DialogSaveParams,
  PermissionRequestSummary,
} from "../bridge/types";

export function useNotify() {
  const bridge = useBridge();
  return React.useCallback(
    (params: { title: string; body?: string }) => bridge.system.notify(params),
    [bridge],
  );
}

export interface UseClipboardResult {
  read: () => Promise<string>;
  write: (text: string) => Promise<{ ok: boolean }>;
}

export function useClipboard(): UseClipboardResult {
  const bridge = useBridge();
  const read = React.useCallback(async () => {
    const result = await bridge.system.clipboardRead();
    return result.text;
  }, [bridge]);
  const write = React.useCallback(
    (text: string) => bridge.system.clipboardWrite(text),
    [bridge],
  );
  return { read, write };
}

export interface UseDialogResult {
  openDirectory: (params?: DialogOpenParams) => Promise<DialogPathResult>;
  openFile: (params?: DialogOpenParams) => Promise<DialogPathResult>;
  saveFile: (params?: DialogSaveParams) => Promise<string | null>;
}

export function useDialog(): UseDialogResult {
  const bridge = useBridge();
  return {
    openDirectory: (params) => bridge.dialog.openDirectory(params),
    openFile: (params) => bridge.dialog.openFile(params),
    saveFile: (params) => bridge.dialog.saveFile(params),
  };
}

export function usePermissions() {
  const bridge = useBridge();
  const list = useAsync(() => bridge.permissions.list(), []);
  const requests = useAsync<PermissionRequestSummary[]>(
    () => bridge.permissions.requests(),
    [],
  );

  const request = React.useCallback(
    async (params: {
      permissions?: string[];
      hosts?: string[];
      reason?: string;
      serverListen?: boolean;
    }) => {
      const out = await bridge.permissions.request(params);
      await Promise.all([list.reload(), requests.reload()]);
      return out;
    },
    [bridge, list.reload, requests.reload],
  );

  const ensure = React.useCallback(
    async (params: { permission?: string; permissions?: string[] }) => {
      const out = await bridge.permissions.ensure(params);
      await list.reload();
      return out;
    },
    [bridge, list.reload],
  );

  const revoke = React.useCallback(
    async (params: { permission?: string; permissions?: string[] }) => {
      const out = await bridge.permissions.revoke(params);
      await list.reload();
      return out;
    },
    [bridge, list.reload],
  );

  return {
    permissions: list.data,
    pending: requests.data ?? [],
    loading: list.loading || requests.loading,
    error: list.error ?? requests.error,
    reload: async () => {
      await Promise.all([list.reload(), requests.reload()]);
    },
    request,
    ensure,
    revoke,
  };
}
