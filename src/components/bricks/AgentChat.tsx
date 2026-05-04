import * as React from "react";
import { useAgentStream } from "../../react/useAgent";
import { Button } from "../primitives/Button";
import { Card } from "../primitives/Card";
import { Field, Textarea } from "../primitives/Field";
import { StatusLine } from "../primitives/StatusLine";
import { Toolbar } from "../primitives/Toolbar";
import { cn } from "../cn";
import type { ReflexSandbox } from "../../bridge/types";

export interface AgentChatProps {
  /** Default cwd for the streaming task — usually a linked project root. */
  cwd?: string;
  defaultPrompt?: string;
  sandbox?: ReflexSandbox;
  /** When true, requests no project context. Best for raw scratch prompts. */
  rawContext?: boolean;
  className?: string;
  placeholder?: string;
  submitLabel?: string;
}

/**
 * Single-turn streamed agent chat: type a prompt, hit submit, see the response
 * accumulate. Wraps `agent.stream` and auto-subscribes to the stream topic via
 * `useAgentStream`.
 */
export function AgentChat({
  cwd,
  defaultPrompt = "",
  sandbox,
  rawContext,
  className,
  placeholder = "Ask the agent…",
  submitLabel = "Run",
}: AgentChatProps) {
  const stream = useAgentStream();
  const [prompt, setPrompt] = React.useState(defaultPrompt);

  async function submit() {
    if (!prompt.trim()) return;
    const params: Parameters<typeof stream.run>[0] = { prompt };
    if (cwd) params.cwd = cwd;
    if (sandbox) params.sandbox = sandbox;
    if (rawContext !== undefined) params.includeContext = !rawContext;
    await stream.run(params);
  }

  return (
    <Card className={cn("grid gap-3", className)}>
      <Field label="Prompt">
        <Textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={placeholder}
          rows={4}
        />
      </Field>
      <Toolbar>
        <Button
          variant="primary"
          onClick={submit}
          loading={stream.status === "running"}
          disabled={!prompt.trim()}
        >
          {submitLabel}
        </Button>
        {stream.status === "running" && (
          <Button variant="ghost" onClick={stream.abort}>
            Stop
          </Button>
        )}
        {stream.status !== "idle" && (
          <Button variant="subtle" onClick={stream.reset}>
            Clear
          </Button>
        )}
        {stream.error && <StatusLine tone="danger">{stream.error}</StatusLine>}
      </Toolbar>
      {(stream.text || stream.status !== "idle") && (
        <div className="bg-reflex-bg border border-reflex-border rounded p-3 text-sm whitespace-pre-wrap leading-relaxed min-h-[80px]">
          {stream.text || (stream.status === "running" ? "Working…" : "")}
        </div>
      )}
    </Card>
  );
}
