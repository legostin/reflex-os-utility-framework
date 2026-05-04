import { reflexInvoke } from "./invoke";
import type {
  MemoryListParams,
  MemoryNote,
  MemoryReadParams,
  MemoryRecallParams,
  MemorySaveParams,
  MemorySearchParams,
  MemoryUpdateParams,
} from "./types";

/**
 * Standardised memory access. Mirrors `memory.*` bridge methods documented in
 * the Reflex OS app runtime. All helpers preserve the host's defaulting rules:
 * `scope` defaults to "project", and project memory targets either the linked
 * project or the app's own project unless `projectId` is supplied.
 */
export const memory = {
  save(params: MemorySaveParams) {
    return reflexInvoke<{ ok: boolean; rel_path?: string; relPath?: string }>(
      "memory.save",
      params,
    );
  },
  read(params: MemoryReadParams) {
    return reflexInvoke<MemoryNote>("memory.read", params);
  },
  update(params: MemoryUpdateParams) {
    return reflexInvoke<{ ok: boolean }>(
      "memory.update",
      params,
    );
  },
  list(params: MemoryListParams = {}) {
    return reflexInvoke<MemoryNote[]>("memory.list", params);
  },
  delete(params: MemoryReadParams) {
    return reflexInvoke<{ ok: boolean }>(
      "memory.delete",
      params,
    );
  },
  search(params: MemorySearchParams) {
    return reflexInvoke<{ matches: MemoryNote[] }>(
      "memory.search",
      params,
    );
  },
  recall(params: MemoryRecallParams) {
    return reflexInvoke<{
      notes: MemoryNote[];
      rag?: Array<{ path?: string; chunk?: string; score?: number }>;
    }>("memory.recall", params);
  },
  stats(params: { projectId?: string } = {}) {
    return reflexInvoke<{
      documents?: number;
      chunks?: number;
      kinds?: Record<string, number>;
      last_indexed_at_ms?: number;
      stale?: number;
      missing?: number;
    }>("memory.stats", params);
  },
  reindex(params: { projectId?: string } = {}) {
    return reflexInvoke<{ ok: boolean; updated?: number }>(
      "memory.reindex",
      params,
    );
  },
  indexPath(params: { path: string; projectId?: string }) {
    return reflexInvoke<{ ok: boolean }>(
      "memory.indexPath",
      params,
    );
  },
  pathStatus(params: { path: string; projectId?: string }) {
    return reflexInvoke<{ indexed?: boolean; updated_at_ms?: number; chunks?: number }>(
      "memory.pathStatus",
      params,
    );
  },
  pathStatusBatch(params: { paths: string[]; projectId?: string }) {
    return reflexInvoke<Record<string, { indexed?: boolean }>>(
      "memory.pathStatusBatch",
      params,
    );
  },
  forgetPath(params: { path: string; projectId?: string }) {
    return reflexInvoke<{ ok: boolean }>(
      "memory.forgetPath",
      params,
    );
  },
} as const;

export type MemoryClient = typeof memory;
