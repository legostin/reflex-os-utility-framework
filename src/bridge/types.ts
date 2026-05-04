/**
 * Shared types describing values that flow across the Reflex bridge. The host
 * bridge is permissive (records of unknowns), so we keep these definitions
 * pragmatic — explicit fields where the host shape is stable, `unknown`/maps
 * elsewhere so users can narrow per-utility without wrestling with the SDK.
 */

export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json };

export type ReflexSandbox = "read-only" | "workspace-write" | "danger-full-access";

export type MemoryScope = "global" | "project" | "topic";

export type MemoryKind =
  | "fact"
  | "feedback"
  | "project"
  | "reference"
  | "user"
  | "snippet"
  | (string & { __brand?: "memory-kind-extension" });

export interface MemoryNote {
  name: string;
  description?: string;
  body?: string;
  kind?: MemoryKind;
  tags?: string[];
  rel_path?: string;
  relPath?: string;
  path?: string;
  scope?: MemoryScope;
  project_id?: string;
  thread_id?: string;
  updated_at_ms?: number;
  created_at_ms?: number;
  [key: string]: unknown;
}

export interface MemorySaveParams {
  scope?: MemoryScope;
  kind?: MemoryKind;
  name: string;
  description?: string;
  body: string;
  tags?: string[];
  projectId?: string;
  threadId?: string;
  source?: string;
}

export interface MemoryListParams {
  scope?: MemoryScope;
  filter?: Record<string, unknown>;
  projectId?: string;
  threadId?: string;
}

export interface MemorySearchParams {
  query: string;
  projectId?: string;
  limit?: number;
}

export interface MemoryRecallParams {
  query: string;
  projectId?: string;
  threadId?: string;
  maxNotes?: number;
  maxRag?: number;
}

export interface MemoryReadParams {
  scope?: MemoryScope;
  relPath: string;
  projectId?: string;
  threadId?: string;
}

export interface MemoryUpdateParams extends Partial<MemorySaveParams> {
  relPath: string;
  scope?: MemoryScope;
  projectId?: string;
  threadId?: string;
}

export interface ProjectSummary {
  id: string;
  name?: string;
  root?: string;
  description?: string;
  sandbox?: ReflexSandbox;
  linked_app_ids?: string[];
  [key: string]: unknown;
}

export interface TopicSummary {
  id?: string;
  thread_id?: string;
  threadId?: string;
  project_id?: string;
  projectId?: string;
  title?: string;
  updated_at_ms?: number;
  [key: string]: unknown;
}

export interface AgentTaskParams {
  prompt: string;
  sandbox?: ReflexSandbox;
  cwd?: string;
  memoryThreadId?: string;
  includeContext?: boolean;
}

export interface AgentStartTopicParams {
  prompt: string;
  projectId?: string;
}

export interface ManifestAction {
  id: string;
  name?: string;
  description?: string;
  public?: boolean;
  params_schema?: Json;
  steps: Array<{ method: string; params?: Json }>;
}

export interface ManifestSchedule {
  id: string;
  name?: string;
  cron: string;
  enabled?: boolean;
  catch_up?: "once" | "missed" | "skip";
  steps: Array<{ method: string; params?: Json }>;
}

export interface ManifestWidget {
  id: string;
  name?: string;
  entry?: string;
  size?: "small" | "medium" | "large";
  description?: string;
}

export interface SystemContext {
  app_id?: string;
  appId?: string;
  app_root?: string;
  manifest?: Record<string, unknown>;
  app_project?: ProjectSummary;
  linked_projects?: ProjectSummary[];
  memory_defaults?: { scope?: MemoryScope; project_id?: string };
  [key: string]: unknown;
}

export interface ReflexEvent<T = unknown> {
  topic: string;
  payload: T;
  ts_ms?: number;
  app_id?: string;
}

export interface StorageListResult {
  keys: string[];
  entries: Array<{ key: string; value: unknown }>;
}

export interface SchedulerRun {
  id: string;
  schedule_id: string;
  app_id?: string;
  status?: "ok" | "error" | "running";
  started_at_ms?: number;
  finished_at_ms?: number;
  error?: string;
  [key: string]: unknown;
}

export interface PermissionRequestSummary {
  id: string;
  permissions?: string[];
  hosts?: string[];
  reason?: string;
  status?: "pending" | "approved" | "denied";
  [key: string]: unknown;
}
