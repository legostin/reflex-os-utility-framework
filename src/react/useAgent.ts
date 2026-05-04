import * as React from "react";
import { useBridge } from "./ReflexProvider";
import type { AgentTaskParams } from "../bridge/types";
import { useEvent } from "./useEvent";

interface AgentStreamState {
  text: string;
  threadId?: string;
  status: "idle" | "running" | "done" | "error";
  error?: string;
}

/**
 * Run an agent prompt and accumulate the streamed response. The host emits
 * stream chunks on a per-thread topic; we subscribe to it as soon as the
 * stream call resolves with the thread id.
 */
export function useAgentStream() {
  const bridge = useBridge();
  const [state, setState] = React.useState<AgentStreamState>({ text: "", status: "idle" });

  useEvent<{ delta?: string; text?: string; status?: string; error?: string }>(
    state.threadId ? `agent.stream:${state.threadId}` : undefined,
    (event) => {
      const payload = event.payload;
      if (!payload) return;
      setState((prev) => {
        const next: AgentStreamState = { ...prev };
        if (typeof payload.delta === "string") next.text = prev.text + payload.delta;
        if (typeof payload.text === "string" && !payload.delta) next.text = payload.text;
        if (payload.status === "done") next.status = "done";
        if (payload.status === "error") {
          next.status = "error";
          next.error = payload.error ?? "Agent stream failed";
        }
        return next;
      });
    },
  );

  const run = React.useCallback(
    async (params: AgentTaskParams) => {
      setState({ text: "", status: "running" });
      try {
        const out = await bridge.agent.stream(params);
        setState((prev) => ({ ...prev, threadId: out.threadId }));
        return out;
      } catch (error) {
        setState({
          text: "",
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    [bridge],
  );

  const abort = React.useCallback(async () => {
    if (!state.threadId) return;
    await bridge.agent.streamAbort(state.threadId);
    setState((prev) => ({ ...prev, status: "done" }));
  }, [bridge, state.threadId]);

  const reset = React.useCallback(() => {
    setState({ text: "", status: "idle" });
  }, []);

  return { ...state, run, abort, reset };
}

export function useAgentTask() {
  const bridge = useBridge();
  return React.useCallback(
    (params: AgentTaskParams) => bridge.agent.task(params),
    [bridge],
  );
}
