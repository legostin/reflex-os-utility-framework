import { reflexInvoke } from "./invoke";
import type { AgentStartTopicParams, AgentTaskParams } from "./types";

export interface AgentAskResult {
  text?: string;
  threadId?: string;
  thread_id?: string;
  [key: string]: unknown;
}

export interface AgentStreamChunk {
  type?: "delta" | "done" | "error" | string;
  delta?: string;
  text?: string;
  error?: string;
  [key: string]: unknown;
}

export const agent = {
  ask(params: { prompt: string }) {
    return reflexInvoke<AgentAskResult>("agent.ask", params);
  },
  startTopic(params: AgentStartTopicParams) {
    return reflexInvoke<{ ok: boolean; threadId?: string; thread_id?: string }>(
      "agent.startTopic",
      params,
    );
  },
  task(params: AgentTaskParams) {
    return reflexInvoke<AgentAskResult>("agent.task", params);
  },
  stream(params: AgentTaskParams) {
    return reflexInvoke<{ threadId: string }>("agent.stream", params);
  },
  streamAbort(threadId: string) {
    return reflexInvoke<{ ok: boolean }>("agent.streamAbort", { threadId });
  },
} as const;

export type AgentClient = typeof agent;
