import * as React from "react";
import { createRoot } from "react-dom/client";
import {
  AppShell,
  Badge,
  Button,
  configureReflexBridge,
  EventLog,
  MemoryComposer,
  MemoryNoteList,
  PermissionRequestBanner,
  ProjectPicker,
  ReflexProvider,
  Section,
  SplitGrid,
  Toolbar,
} from "reflex-os-utility-framework";
import "./index.css";

// Mock data so the demo runs in a plain browser tab. When loaded inside Reflex
// OS the host injects window.reflexInvoke and the mock is ignored.
configureReflexBridge({
  mock: {
    handlers: {
      "projects.list": () => [
        { id: "demo", name: "Demo project" },
        { id: "ops", name: "Ops" },
      ],
      "memory.list": () => [
        {
          name: "Onboarding checklist",
          description: "Steps for first-day setup",
          kind: "fact",
          tags: ["onboarding", "ops"],
          rel_path: "ops/onboarding.md",
        },
      ],
      "memory.save": () => ({ ok: true }),
      "memory.delete": () => ({ ok: true }),
      "events.recent": () => [],
      "events.subscribe": () => ({ ok: true }),
      "events.unsubscribe": () => ({ ok: true }),
      "permissions.requests": () => [],
      "topics.list": () => [],
      "bridge.catalog": () => ({
        methods: ["memory.save", "memory.list", "topics.list", "events.emit"],
        helpers: [],
      }),
    },
  },
});

function App() {
  const [projectId, setProjectId] = React.useState<string | "global">("demo");
  const [tick, setTick] = React.useState(0);

  return (
    <AppShell
      title={
        <span className="flex items-center gap-2">
          Memory Capsule <Badge tone="info">demo</Badge>
        </span>
      }
      subtitle="Capture durable notes, search memory, and recall context across projects."
      toolbar={
        <Toolbar>
          <Button variant="subtle" onClick={() => setTick((t) => t + 1)}>
            Reload
          </Button>
        </Toolbar>
      }
    >
      <PermissionRequestBanner />
      <Section
        title="Project"
        description="Pick where new notes are saved. Global memory persists across projects."
      >
        <ProjectPicker
          value={projectId}
          onChange={setProjectId}
          includeGlobal
          globalLabel="Global memory"
        />
      </Section>
      <SplitGrid template="minmax(320px,1fr) minmax(320px,1.2fr)">
        <Section title="Save memory">
          <MemoryComposer
            defaultProjectId={projectId === "global" ? undefined : projectId}
            defaultScope={projectId === "global" ? "global" : "project"}
            source="example:quick-capture-demo"
            onSaved={() => setTick((t) => t + 1)}
          />
        </Section>
        <Section title="Notes">
          <MemoryNoteList
            key={tick}
            scope={projectId === "global" ? "global" : "project"}
            projectId={projectId === "global" ? undefined : projectId}
          />
        </Section>
      </SplitGrid>
      <Section title="Event log" description="Listens to inter-app topic 'ops.health'.">
        <EventLog topic="ops.health" />
      </Section>
    </AppShell>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReflexProvider>
      <App />
    </ReflexProvider>
  </React.StrictMode>,
);
