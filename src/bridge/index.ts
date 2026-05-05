export {
  configureReflexBridge,
  defineBridgeMethod,
  hasReflexHost,
  reflexInvoke,
  resetReflexBridge,
} from "./invoke";
export type {
  ReflexBridgeMethod,
  ReflexBridgeMock,
  ReflexBridgeOptions,
  ReflexBridgePayload,
  ReflexInvokeFn,
} from "./invoke";

export * from "./types";

export { agent } from "./agent";
export type { AgentAskResult, AgentClient, AgentStreamChunk } from "./agent";

export { apps } from "./apps";
export type { AppsClient } from "./apps";

export { browser } from "./browser";
export type { BrowserClient } from "./browser";

export { dialog } from "./dialog";
export type { DialogClient } from "./dialog";

export { events } from "./events";
export type { EventsClient } from "./events";

export { fs, projectFiles } from "./fs";
export type { FsClient, FsEntry, ProjectFilesClient } from "./fs";

export { integration } from "./integration";
export type { IntegrationClient } from "./integration";

export {
  actions,
  manifest,
  scheduler,
  widgets,
} from "./manifest";
export type {
  ActionsClient,
  ManifestClient,
  SchedulerClient,
  WidgetsClient,
} from "./manifest";

export { mcp } from "./mcp";
export type { McpClient } from "./mcp";

export { memory } from "./memory";
export type { MemoryClient } from "./memory";

export { network, permissions } from "./permissions";
export type { NetworkClient, PermissionsClient } from "./permissions";

export { secrets } from "./secrets";
export type {
  SecretMetadata,
  SecretsClient,
  SecretsScopeDescriptor,
  SecretScope,
  SecretValue,
} from "./secrets";

export { skills } from "./skills";
export type { SkillsClient } from "./skills";

export { storage } from "./storage";
export type { StorageClient, StorageGetResult } from "./storage";

export { system } from "./system";
export type { ReflexPanel, SystemClient } from "./system";

export { projects, topics } from "./topics";
export type { ProjectsClient, TopicsClient } from "./topics";

import { agent } from "./agent";
import { apps } from "./apps";
import { browser } from "./browser";
import { dialog } from "./dialog";
import { events } from "./events";
import { fs, projectFiles } from "./fs";
import { integration } from "./integration";
import { actions, manifest, scheduler, widgets } from "./manifest";
import { mcp } from "./mcp";
import { memory } from "./memory";
import { network, permissions } from "./permissions";
import { secrets } from "./secrets";
import { skills } from "./skills";
import { storage } from "./storage";
import { system } from "./system";
import { projects, topics } from "./topics";

/**
 * Convenience aggregate. Prefer the named clients for tree-shaking.
 */
export const bridge = {
  actions,
  agent,
  apps,
  browser,
  dialog,
  events,
  fs,
  integration,
  manifest,
  mcp,
  memory,
  network,
  permissions,
  projectFiles,
  projects,
  scheduler,
  secrets,
  skills,
  storage,
  system,
  topics,
  widgets,
} as const;

export type ReflexBridge = typeof bridge;
