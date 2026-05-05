# reflex-os-utility-framework

Tailwind + React framework for building [Reflex OS](https://github.com/legostin/reflex-os)
utilities. Standardises how a Reflex utility talks to the host bridge
(`memory.*`, `topics.*`, `events.*`, `agent.*`, `storage.*`, …) and gives the
agent generator a fixed pile of low- and high-level building blocks so every
new utility ends up with the same shape, the same accessibility and the same
permission semantics.

## What you get

- **`/bridge`** — a typed, promise-based wrapper around `window.reflexInvoke`
  with sensible defaults, postMessage fallback, and a hookable mock so a
  utility runs locally in a browser tab during development. Covers **100% of
  the host bridge surface** (143 method ids), enforced by a build-time
  coverage gate (`pnpm check:coverage`).
- **`/react`** — `ReflexProvider`, `useBridge`, and a hook for every bridge
  area: memory, topics, events, storage, agent (streamed + one-shot),
  apps + app server, browser sidecar, integration, mcp, skills, scheduler
  (list/runs/stats), fs, project files, dialog, notify, clipboard,
  permissions, system context, bridge catalog, projects, manifest.
- **`/components`** — Tailwind primitives (`Button`, `Card`, `Section`,
  `Field`, `Input`, `Textarea`, `Select`, `Badge`, `EmptyState`, `Toolbar`,
  `StatusLine`, `Tabs`, `JsonView`, `Modal`, `ToastProvider`/`useToast`,
  `Spinner`, `Skeleton`, `DataTable`, `AppShell`, `SplitGrid`) plus
  high-level *bricks* matched 1:1 to bridge areas:
  `MemoryComposer`, `MemoryNoteList`, `TopicsList`, `EventLog`,
  `StorageBrowser`, `AgentChat`, `BridgeMethodPicker`, `ActionRunner`,
  `PermissionRequestBanner`, `MarkdownView`, `ProjectPicker`,
  `SkillsManager`, `McpServerList`, `IntegrationProfileCard`,
  `SchedulesList`, `SchedulerRunsLog`, `SchedulerStatsCard`,
  `AppsList`, `AppDiffView`, `AppRevisionToolbar`, `AppServerControls`,
  `BrowserTabBar`, `BrowserSnapshotView`, `FsBrowser`, `FilePicker`,
  `NotifyButton`, `LogViewer`.
- **`/tailwind-preset`** — design tokens (dark surfaces, warm cream
  foreground, indigo links) that match Reflex OS built-in apps.

## Install

```sh
pnpm add reflex-os-utility-framework react react-dom
pnpm add -D tailwindcss
```

`tailwindcss` is an optional peer; the package itself never imports it.

## Use it in a Reflex utility

A Reflex utility is a static HTML page (or a small server) loaded into the
host iframe. The bundle here is ESM-friendly, so any modern bundler works —
the example uses Vite.

### `tailwind.config.cjs`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("reflex-os-utility-framework/tailwind-preset")],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,html}",
    "./node_modules/reflex-os-utility-framework/dist/**/*.{js,cjs}",
  ],
};
```

### `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
@import "reflex-os-utility-framework/styles.css";
```

### `src/main.tsx`

```tsx
import * as React from "react";
import { createRoot } from "react-dom/client";
import {
  AppShell,
  MemoryComposer,
  MemoryNoteList,
  ProjectPicker,
  ReflexProvider,
  Section,
  SplitGrid,
} from "reflex-os-utility-framework";
import "./index.css";

function App() {
  const [projectId, setProjectId] = React.useState<string | "global">("global");
  return (
    <AppShell title="Memory Capsule" subtitle="Capture and recall durable notes.">
      <Section title="Project">
        <ProjectPicker value={projectId} onChange={setProjectId} includeGlobal />
      </Section>
      <SplitGrid template="minmax(280px,1fr) minmax(280px,1.2fr)">
        <Section title="Save memory">
          <MemoryComposer
            defaultProjectId={projectId === "global" ? undefined : projectId}
            source="app:memory-capsule"
          />
        </Section>
        <Section title="Notes">
          <MemoryNoteList
            scope={projectId === "global" ? "global" : "project"}
            projectId={projectId === "global" ? undefined : projectId}
          />
        </Section>
      </SplitGrid>
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
```

## Layered API

```
┌────────────────────────────┐
│  components (bricks)       │  MemoryComposer · TopicsList · AgentChat · ActionRunner …
├────────────────────────────┤
│  components (primitives)   │  Button · Card · Field · Toolbar · Badge · EmptyState
├────────────────────────────┤
│  react (hooks + provider)  │  useMemoryNotes · useStorage · useEvent · useAgentStream
├────────────────────────────┤
│  bridge (typed clients)    │  memory · topics · events · storage · agent · fs · …
├────────────────────────────┤
│  bridge (raw)              │  reflexInvoke(method, params) — postMessage transport
└────────────────────────────┘
```

Each layer is independently importable: pick `bridge` if you only need a
typed RPC client, add `react` if you want hooks, layer `components` on top
when you want the visual kit too.

### Bridge namespaces

| Module | Bridge methods covered |
|---|---|
| `memory` | `memory.save`, `read`, `update`, `list`, `delete`, `search`, `recall`, `stats`, `reindex`, `indexPath`, `pathStatus`, `pathStatusBatch`, `forgetPath` |
| `projects`, `topics` | `projects.*`, `project.profile.update`, `project.sandbox.set`, `project.apps.{link,unlink}`, `topics.list`, `topics.open` |
| `events` | `events.{subscribe,unsubscribe,emit,recent,subscriptions,clearSubscriptions}` plus a local handler registry for fan-out |
| `agent` | `agent.{ask,startTopic,task,stream,streamAbort}` |
| `storage` | `storage.{get,set,list,delete}` with `useState`-style ergonomics |
| `fs`, `projectFiles` | `fs.*`, `project.files.*` |
| `manifest`, `actions`, `widgets`, `scheduler` | `manifest.{get,update}`, `actions.*`, `widgets.*`, `scheduler.*` |
| `permissions`, `network` | `permissions.*`, `network.*`, `net.fetch` |
| `system` | `bridge.catalog`, `system.*`, `notify.show`, `logs.*`, `clipboard.*` |
| `apps` | `apps.{list,create,open,status,diff,commit,commitPartial,revert,delete,trashList,restore,purge,export,import,exportGithub,importGithub,export_github,import_github,server.{status,logs,start,stop,restart},invoke,list_actions}` |
| `browser` | `browser.{init,tabs.list,open,close,setActive,navigate,back,forward,reload,currentUrl,readText,readOutline,screenshot,clickText,clickSelector,fill,scroll,waitFor}`, `project.browser.setEnabled` |
| `integration` | `integration.{catalog,profile,update,learnVisible,mcpStatus,mcpQuery}` |
| `mcp` | `mcp.servers`, `project.mcp.{upsert,delete}` |
| `skills` | `skills.list`, `project.skills.{ensure,revoke}` |
| `dialog` | `dialog.{openDirectory,openFile,saveFile}` |
| `secrets` | `secrets.{list,get,has,set,delete,resolve,scopes}` — encrypted global + per-project store with cascade resolution. |

### Local development without Reflex

```ts
import { configureReflexBridge } from "reflex-os-utility-framework/bridge";

configureReflexBridge({
  mock: {
    handlers: {
      "memory.list": () => [
        { name: "Local note", body: "Hello", kind: "fact", rel_path: "demo.md" },
      ],
      "projects.list": () => [{ id: "demo", name: "Demo project" }],
    },
  },
});
```

When `window.reflexInvoke` is missing and no parent frame is available, the
mock takes over.

## Generated utilities

Reflex OS has an *Advanced utility framework* skill that tells the agent to:

1. Scaffold new utilities with `tsup`/`vite` + this framework.
2. Prefer hooks and bricks over re-implementing bridge plumbing.
3. Reuse the Tailwind preset and design tokens.
4. Pin `manifest.permissions` per the bridge methods actually used.

See [`reflex-os` repository → `.claude/skills/utility-framework`](https://github.com/legostin/reflex-os)
for the full skill text.

## Build

```sh
pnpm install
pnpm typecheck
pnpm check:coverage   # asserts 100% bridge method coverage
pnpm build            # runs check:coverage + tsup + copies styles.css
```

Outputs ESM + CJS + `.d.ts` in `dist/`, plus `dist/styles.css` for the base
stylesheet. The coverage gate compares against
`scripts/bridge-catalog.json`, regenerated from `reflex-os` via:

```sh
# From inside reflex-os-utility-framework/, with reflex-os checked out at ../reflex-os
pnpm refresh:catalog
```

## Examples

Each example is a self-contained Vite project under `examples/` that uses
the framework with a mocked bridge invoker, so they all run without Reflex
OS. Bring up any of them with `pnpm install` at the repo root, then:

```sh
pnpm --filter @reflex-os/example-quick-capture-demo dev
pnpm --filter @reflex-os/example-agent-chat-demo dev
pnpm --filter @reflex-os/example-browser-tab-monitor dev
pnpm --filter @reflex-os/example-scheduler-cockpit dev
pnpm --filter @reflex-os/example-apps-manager dev
```

## License

MIT © legostin
