import * as React from "react";
import { createRoot } from "react-dom/client";
import {
  AgentChat,
  AppShell,
  ProjectPicker,
  ReflexProvider,
  Section,
  ToastProvider,
  configureReflexBridge,
} from "reflex-os-utility-framework";
import "./index.css";

// Mock host so the example works in a plain browser tab.
configureReflexBridge({
  mock: {
    handlers: {
      "projects.list": () => [
        { id: "demo", name: "Demo project" },
        { id: "ops", name: "Ops" },
      ],
      "agent.stream": async () => {
        const threadId = "thread_" + Math.random().toString(36).slice(2);
        // Fire a fake delta sequence shortly after the call resolves.
        setTimeout(() => {
          window.postMessage(
            {
              source: "reflex",
              type: "event",
              topic: `agent.stream:${threadId}`,
              payload: { delta: "Hello — this is a mocked agent reply.\n" },
              ts_ms: Date.now(),
            },
            "*",
          );
          window.postMessage(
            {
              source: "reflex",
              type: "event",
              topic: `agent.stream:${threadId}`,
              payload: { delta: "Connect Reflex OS to see real streamed output." },
              ts_ms: Date.now(),
            },
            "*",
          );
          window.postMessage(
            {
              source: "reflex",
              type: "event",
              topic: `agent.stream:${threadId}`,
              payload: { status: "done" },
              ts_ms: Date.now(),
            },
            "*",
          );
        }, 80);
        return { threadId };
      },
      "agent.streamAbort": () => ({ ok: true }),
      "events.subscribe": () => ({ ok: true }),
      "events.unsubscribe": () => ({ ok: true }),
      "permissions.requests": () => [],
    },
  },
});

function App() {
  const [projectId, setProjectId] = React.useState<string | "global">("demo");
  return (
    <AppShell title="Agent Chat" subtitle="Streamed agent.task wrapped in a single brick.">
      <Section title="Project (controls cwd / context)">
        <ProjectPicker value={projectId} onChange={setProjectId} includeGlobal />
      </Section>
      <Section title="Chat">
        <AgentChat
          cwd={projectId === "global" ? undefined : `/projects/${projectId}`}
          placeholder="Ask the agent…"
        />
      </Section>
    </AppShell>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReflexProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ReflexProvider>
  </React.StrictMode>,
);
