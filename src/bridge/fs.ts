import { reflexInvoke } from "./invoke";

export interface FsEntry {
  name: string;
  path: string;
  kind: "file" | "directory";
  size?: number;
  modified_at_ms?: number;
}

export const fs = {
  read(path: string) {
    return reflexInvoke<{ content: string; size?: number }>("fs.read", { path });
  },
  write(path: string, content: string) {
    return reflexInvoke<{ ok: boolean }>("fs.write", { path, content });
  },
  list(params: { path?: string; recursive?: boolean; includeHidden?: boolean } = {}) {
    return reflexInvoke<{ entries: FsEntry[] }>("fs.list", params);
  },
  delete(params: { path: string; recursive?: boolean }) {
    return reflexInvoke<{ ok: boolean; kind?: string }>(
      "fs.delete",
      params,
    );
  },
} as const;

export const projectFiles = {
  list(params: {
    projectId?: string;
    path?: string;
    recursive?: boolean;
    includeHidden?: boolean;
  } = {}) {
    return reflexInvoke<{ project_id: string; project_name?: string; entries: FsEntry[] }>(
      "project.files.list",
      params,
    );
  },
  read(params: { projectId?: string; path: string }) {
    return reflexInvoke<{ project_id: string; path: string; content: string; size?: number }>(
      "project.files.read",
      params,
    );
  },
  search(params: {
    projectId?: string;
    query: string;
    path?: string;
    recursive?: boolean;
    includeHidden?: boolean;
    includeContent?: boolean;
    limit?: number;
  }) {
    return reflexInvoke<{
      query: string;
      matches: Array<{ path: string; line?: number; preview?: string; score?: number }>;
      scanned?: number;
      truncated?: boolean;
    }>("project.files.search", params);
  },
  write(params: {
    projectId?: string;
    path: string;
    content: string;
    createDirs?: boolean;
    overwrite?: boolean;
  }) {
    return reflexInvoke<{ ok: boolean; size?: number }>(
      "project.files.write",
      params,
    );
  },
  mkdir(params: { projectId?: string; path: string; recursive?: boolean }) {
    return reflexInvoke<{ ok: boolean; created?: boolean }>(
      "project.files.mkdir",
      params,
    );
  },
  delete(params: { projectId?: string; path: string; recursive?: boolean }) {
    return reflexInvoke<{ ok: boolean; kind?: string }>(
      "project.files.delete",
      params,
    );
  },
  move(params: {
    projectId?: string;
    from: string;
    to: string;
    createDirs?: boolean;
    overwrite?: boolean;
  }) {
    return reflexInvoke<{ ok: boolean; kind?: string }>(
      "project.files.move",
      params,
    );
  },
  copy(params: {
    projectId?: string;
    from: string;
    to: string;
    createDirs?: boolean;
    overwrite?: boolean;
    recursive?: boolean;
  }) {
    return reflexInvoke<{ ok: boolean; kind?: string }>(
      "project.files.copy",
      params,
    );
  },
} as const;

export type FsClient = typeof fs;
export type ProjectFilesClient = typeof projectFiles;
