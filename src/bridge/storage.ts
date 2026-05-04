import { reflexInvoke } from "./invoke";
import type { StorageListResult } from "./types";

export interface StorageGetResult<T> {
  value: T | null;
}

export const storage = {
  async get<T = unknown>(key: string, fallback?: T): Promise<T | undefined> {
    const raw = await reflexInvoke<StorageGetResult<T>>("storage.get", { key });
    if (raw && Object.prototype.hasOwnProperty.call(raw, "value") && raw.value !== null) {
      return raw.value as T;
    }
    return fallback;
  },
  async getRaw<T = unknown>(key: string) {
    return reflexInvoke<StorageGetResult<T>>("storage.get", { key });
  },
  set<T>(key: string, value: T) {
    return reflexInvoke<{ ok: boolean }>("storage.set", { key, value });
  },
  list(params: { prefix?: string } = {}) {
    return reflexInvoke<StorageListResult>("storage.list", params);
  },
  delete(params: string | { key?: string; keys?: string[] }) {
    const payload =
      typeof params === "string" ? { key: params } : (params);
    return reflexInvoke<{ ok: boolean; deleted?: string[]; missing?: string[] }>(
      "storage.delete",
      payload,
    );
  },
} as const;

export type StorageClient = typeof storage;
