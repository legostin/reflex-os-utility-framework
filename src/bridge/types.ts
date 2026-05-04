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

export interface PermissionRequestSummary {
  id: string;
  permissions?: string[];
  hosts?: string[];
  reason?: string;
  status?: "pending" | "approved" | "denied";
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// apps.* and apps.server.* shapes
// ---------------------------------------------------------------------------

export type AppKind = "panel" | "static" | "server" | "external" | string;
export type AppRuntime = "static" | "server" | "external" | string;

export interface AppSummary {
  id: string;
  name?: string;
  description?: string;
  icon?: string;
  kind?: AppKind;
  runtime?: AppRuntime;
  entry?: string;
  /** Truthy if the app is in the trash, with the trash record id. */
  trash_id?: string;
  /** Bumped on every app revision. */
  revision?: number;
  /** True when the working tree has uncommitted edits. */
  dirty?: boolean;
  last_commit_message?: string;
  linked_project_ids?: string[];
  manifest?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface AppStatus {
  app_id: string;
  revision?: number;
  dirty?: boolean;
  last_commit_message?: string;
  entry_ready?: boolean;
  [key: string]: unknown;
}

export interface AppServerStatus {
  app_id: string;
  running: boolean;
  port?: number;
  pid?: number;
  url?: string;
  health?: "ok" | "starting" | "error" | string;
  last_error?: string;
  uptime_ms?: number;
  [key: string]: unknown;
}

export interface AppServerLogEntry {
  ts_ms?: number;
  level?: "info" | "warn" | "error" | string;
  source?: string;
  message: string;
  [key: string]: unknown;
}

export interface AppDiffResult {
  app_id: string;
  /** Unified diff text. May be empty when the working tree is clean. */
  diff: string;
}

export interface AppTrashEntry {
  trash_id: string;
  app_id: string;
  name?: string;
  trashed_at_ms?: number;
  [key: string]: unknown;
}

export type AppTemplate =
  | "blank"
  | "chat"
  | "dashboard"
  | "health-dashboard"
  | "form"
  | "api-client"
  | "connected-app"
  | "repo-wrapper"
  | "automation"
  | "node-server"
  | (string & { __brand?: "app-template-extension" });

// ---------------------------------------------------------------------------
// browser.* shapes
// ---------------------------------------------------------------------------

export interface BrowserTab {
  id: string;
  url: string;
  title?: string;
  active?: boolean;
  loading?: boolean;
  project_id?: string;
  [key: string]: unknown;
}

export interface BrowserOutlineNode {
  tag?: string;
  role?: string;
  text?: string;
  href?: string;
  children?: BrowserOutlineNode[];
  [key: string]: unknown;
}

export interface BrowserScreenshot {
  tab_id: string;
  /** Data URL or base64 PNG, depending on host build. */
  image: string;
  width?: number;
  height?: number;
}

// ---------------------------------------------------------------------------
// integration.* shapes (Connected App adapters)
// ---------------------------------------------------------------------------

export interface IntegrationCatalogEntry {
  provider: string;
  display_name?: string;
  description?: string;
  expected_display?: Record<string, unknown>;
  expected_data?: Record<string, unknown>;
  auth?: Record<string, unknown>;
  mcp?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface IntegrationProfile {
  integration?: Record<string, unknown>;
  external?: Record<string, unknown>;
  linked_project_ids?: string[];
  app_id?: string;
  [key: string]: unknown;
}

export interface IntegrationMcpStatus {
  provider?: string;
  server_name?: string;
  configured?: boolean;
  reachable?: boolean;
  details?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface IntegrationMcpResult {
  query: string;
  text?: string;
  data?: unknown;
  recorded_at_ms?: number;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// mcp.* shapes
// ---------------------------------------------------------------------------

export interface McpServerConfig {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  cwd?: string;
  enabled?: boolean;
  [key: string]: unknown;
}

export interface McpServerSummary {
  project_id: string;
  project_name?: string;
  server_names: string[];
  servers?: Record<string, McpServerConfig>;
}

// ---------------------------------------------------------------------------
// skills.* shapes
// ---------------------------------------------------------------------------

export interface SkillsByProject {
  project_id: string;
  project_name?: string;
  skills: string[];
}

// ---------------------------------------------------------------------------
// scheduler.* shapes (typed replacements for Record<string, unknown>)
// ---------------------------------------------------------------------------

export interface SchedulerRun {
  id: string;
  schedule_id: string;
  app_id?: string;
  status?: "ok" | "error" | "running" | string;
  started_at_ms?: number;
  finished_at_ms?: number;
  error?: string;
  /** Final payload of the last step, or summary text. */
  result?: unknown;
  [key: string]: unknown;
}

export interface SchedulerStats {
  schedule_count?: number;
  enabled_count?: number;
  next_fire_at_ms?: number;
  recent_runs?: SchedulerRun[];
  recent_errors?: SchedulerRun[];
  last_error?: { message?: string; ts_ms?: number };
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// logs.* shapes
// ---------------------------------------------------------------------------

export interface LogEntry {
  seq?: number;
  ts_ms?: number;
  level?: "info" | "warn" | "error" | "debug" | string;
  source?: string;
  message: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// dialog.* shapes
// ---------------------------------------------------------------------------

export interface DialogFilter {
  name: string;
  extensions: string[];
}

export interface DialogOpenParams {
  title?: string;
  defaultPath?: string;
  multiple?: boolean;
  filters?: DialogFilter[];
}

export interface DialogSaveParams {
  title?: string;
  defaultPath?: string;
  filters?: DialogFilter[];
}

export type DialogPathResult = string | string[] | null;
