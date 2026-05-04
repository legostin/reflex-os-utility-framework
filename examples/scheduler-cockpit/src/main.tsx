import * as React from "react";
import { createRoot } from "react-dom/client";
import {
  AppShell,
  ReflexProvider,
  SchedulerRunsLog,
  SchedulerStatsCard,
  SchedulesList,
  Section,
  SplitGrid,
  ToastProvider,
  configureReflexBridge,
} from "reflex-os-utility-framework";
import "./index.css";

const schedules = [
  {
    id: "quick-capture-review",
    name: "Quick Capture review",
    cron: "0 0 9 * * *",
    enabled: true,
    steps: [{ method: "notify.show", params: { title: "Review", body: "Process inbox." } }],
  },
  {
    id: "memory-reindex",
    name: "Memory reindex",
    cron: "0 0 */6 * * *",
    enabled: false,
    steps: [{ method: "memory.reindex", params: {} }],
  },
];

configureReflexBridge({
  mock: {
    handlers: {
      "scheduler.list": () => schedules,
      "scheduler.upsert": ({ schedule }: any) => {
        const target = schedule ?? null;
        if (!target) return { ok: true };
        const idx = schedules.findIndex((s) => s.id === target.id);
        if (idx >= 0) schedules[idx] = target;
        else schedules.push(target);
        return { ok: true };
      },
      "scheduler.delete": ({ scheduleId }: any) => {
        const idx = schedules.findIndex((s) => s.id === scheduleId);
        if (idx >= 0) schedules.splice(idx, 1);
        return { ok: true };
      },
      "scheduler.runNow": () => ({ ok: true, runId: "run_" + Date.now().toString(36) }),
      "scheduler.setPaused": ({ scheduleId, paused }: any) => {
        const target = schedules.find((s) => s.id === scheduleId);
        if (target) target.enabled = !paused;
        return { ok: true };
      },
      "scheduler.runs": () => [
        {
          id: "run_a",
          schedule_id: "quick-capture-review",
          status: "ok",
          started_at_ms: Date.now() - 90 * 1000,
          finished_at_ms: Date.now() - 88 * 1000,
        },
        {
          id: "run_b",
          schedule_id: "memory-reindex",
          status: "error",
          started_at_ms: Date.now() - 3600 * 1000,
          finished_at_ms: Date.now() - 3599 * 1000,
          error: "RAG embedding failed: timeout",
        },
      ],
      "scheduler.stats": () => ({
        schedule_count: schedules.length,
        enabled_count: schedules.filter((s) => s.enabled).length,
        next_fire_at_ms: Date.now() + 12 * 3600 * 1000,
        last_error: { message: "RAG embedding failed: timeout", ts_ms: Date.now() - 3600 * 1000 },
      }),
    },
  },
});

function App() {
  return (
    <AppShell title="Scheduler Cockpit" subtitle="Inspect schedules, runs, and stats from one panel.">
      <SplitGrid template="minmax(280px,1fr) minmax(320px,1.2fr)">
        <Section title="Health">
          <SchedulerStatsCard />
        </Section>
        <Section title="Schedules">
          <SchedulesList />
        </Section>
      </SplitGrid>
      <Section title="Recent runs">
        <SchedulerRunsLog limit={20} />
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
