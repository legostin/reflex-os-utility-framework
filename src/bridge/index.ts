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
export { events } from "./events";
export type { EventsClient } from "./events";
export { fs, projectFiles } from "./fs";
export type { FsClient, FsEntry, ProjectFilesClient } from "./fs";
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
export { memory } from "./memory";
export type { MemoryClient } from "./memory";
export { network, permissions } from "./permissions";
export type { NetworkClient, PermissionsClient } from "./permissions";
export { storage } from "./storage";
export type { StorageClient } from "./storage";
export { system } from "./system";
export type { ReflexPanel, SystemClient } from "./system";
export { projects, topics } from "./topics";
export type { ProjectsClient, TopicsClient } from "./topics";

import { agent } from "./agent";
import { events } from "./events";
import { fs, projectFiles } from "./fs";
import { actions, manifest, scheduler, widgets } from "./manifest";
import { memory } from "./memory";
import { network, permissions } from "./permissions";
import { storage } from "./storage";
import { system } from "./system";
import { projects, topics } from "./topics";

/**
 * Convenience aggregate. Prefer the named clients for tree-shaking.
 */
export const bridge = {
  actions,
  agent,
  events,
  fs,
  manifest,
  memory,
  network,
  permissions,
  projectFiles,
  projects,
  scheduler,
  storage,
  system,
  topics,
  widgets,
} as const;

export type ReflexBridge = typeof bridge;
