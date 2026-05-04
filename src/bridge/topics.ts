import { reflexInvoke } from "./invoke";
import type { ProjectSummary, ReflexSandbox, TopicSummary } from "./types";

export const projects = {
  list(params: { includeAll?: boolean } = {}) {
    return reflexInvoke<ProjectSummary[]>("projects.list", params);
  },
  open(projectId: string) {
    return reflexInvoke<{ ok: boolean }>("projects.open", { projectId });
  },
  profileUpdate(params: {
    projectId?: string;
    description?: string | null;
    agentInstructions?: string | null;
  }) {
    return reflexInvoke<{ ok: boolean; changed?: boolean; project?: ProjectSummary }>(
      "project.profile.update",
      params,
    );
  },
  sandboxSet(params: { projectId?: string; sandbox: ReflexSandbox }) {
    return reflexInvoke<{ ok: boolean; sandbox?: ReflexSandbox; project?: ProjectSummary }>(
      "project.sandbox.set",
      params,
    );
  },
  appLink(params: { projectId?: string; appId?: string } = {}) {
    return reflexInvoke<{ ok: boolean; linked?: boolean; app_id?: string }>(
      "project.apps.link",
      params,
    );
  },
  appUnlink(params: { projectId?: string; appId?: string } = {}) {
    return reflexInvoke<{ ok: boolean; unlinked?: boolean }>(
      "project.apps.unlink",
      params,
    );
  },
} as const;

export const topics = {
  list(params: { projectId?: string; limit?: number; includeAll?: boolean } = {}) {
    return reflexInvoke<TopicSummary[]>("topics.list", params);
  },
  open(params: { threadId: string; projectId?: string }) {
    return reflexInvoke<{ ok: boolean }>("topics.open", params);
  },
} as const;

export type ProjectsClient = typeof projects;
export type TopicsClient = typeof topics;
