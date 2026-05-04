import * as React from "react";
import { createRoot } from "react-dom/client";
import {
  AppDiffView,
  AppRevisionToolbar,
  AppServerControls,
  AppShell,
  AppsList,
  ReflexProvider,
  Section,
  SplitGrid,
  ToastProvider,
  configureReflexBridge,
} from "reflex-os-utility-framework";
import "./index.css";

const apps = [
  {
    id: "system-quick-capture",
    name: "System · Quick Capture",
    icon: "QC",
    kind: "panel",
    runtime: "static",
    revision: 12,
    dirty: false,
  },
  {
    id: "ops-dashboard",
    name: "Ops Dashboard",
    icon: "OD",
    kind: "dashboard",
    runtime: "server",
    revision: 5,
    dirty: true,
  },
];

configureReflexBridge({
  mock: {
    handlers: {
      "apps.list": () => apps,
      "apps.status": ({ app_id }: any) => apps.find((a) => a.id === app_id) ?? { app_id, dirty: false },
      "apps.diff": ({ app_id }: any) =>
        app_id === "ops-dashboard"
          ? {
              app_id,
              diff: [
                "diff --git a/index.html b/index.html",
                "@@ -1,3 +1,4 @@",
                " <!doctype html>",
                "+<meta charset=\"utf-8\" />",
                " <html lang=\"en\">",
              ].join("\n"),
            }
          : { app_id, diff: "" },
      "apps.commit": () => ({ ok: true, revision: 13 }),
      "apps.revert": () => ({ ok: true }),
      "apps.delete": ({ app_id }: any) => ({ ok: true, trash_id: "trash-" + app_id }),
      "apps.open": () => ({ ok: true }),
      "apps.server.status": ({ app_id }: any) => ({
        app_id,
        running: app_id === "ops-dashboard",
        port: 8123,
        pid: 4242,
        health: "ok",
      }),
      "apps.server.logs": () => ({
        entries: [
          { ts_ms: Date.now() - 30 * 1000, level: "info", message: "Server up on :8123" },
          { ts_ms: Date.now() - 20 * 1000, level: "info", message: "GET /health 200 (3ms)" },
          { ts_ms: Date.now() - 5 * 1000, level: "warn", message: "Slow query: 1.4s" },
        ],
      }),
      "apps.server.start": () => ({ app_id: "ops-dashboard", running: true, port: 8123 }),
      "apps.server.stop": () => ({ app_id: "ops-dashboard", running: false }),
      "apps.server.restart": () => ({ app_id: "ops-dashboard", running: true, port: 8123 }),
    },
  },
});

function App() {
  const [selected, setSelected] = React.useState<string | undefined>("ops-dashboard");
  return (
    <AppShell title="Apps Manager" subtitle="List, diff, commit, revert, and supervise app runtimes.">
      <SplitGrid template="minmax(320px,1fr) minmax(380px,1.2fr)">
        <Section title="Apps">
          <AppsList onSelect={(app) => setSelected(app.id)} />
        </Section>
        <div className="grid gap-3">
          <Section title="Working tree diff">
            <AppDiffView appId={selected} />
          </Section>
          <Section title="Revisions">
            <AppRevisionToolbar appId={selected} />
          </Section>
          <Section title="Server runtime">
            <AppServerControls appId={selected} />
          </Section>
        </div>
      </SplitGrid>
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
