import * as React from "react";
import { createRoot } from "react-dom/client";
import {
  AppShell,
  BrowserSnapshotView,
  BrowserTabBar,
  EventLog,
  ReflexProvider,
  Section,
  SplitGrid,
  ToastProvider,
  configureReflexBridge,
} from "reflex-os-utility-framework";
import "./index.css";

const fakeTabs = [
  { id: "tab-a", url: "https://example.com", title: "Example", active: true },
  { id: "tab-b", url: "https://reflex.local", title: "Reflex local" },
];

configureReflexBridge({
  mock: {
    handlers: {
      "browser.init": () => ({ ok: true }),
      "browser.tabs.list": () => fakeTabs,
      "browser.open": (params: any) => {
        const tab = { id: "tab-" + Date.now().toString(36), url: params.url, title: params.url };
        fakeTabs.push(tab);
        return tab;
      },
      "browser.close": ({ tabId }: any) => {
        const idx = fakeTabs.findIndex((tab) => tab.id === tabId);
        if (idx >= 0) fakeTabs.splice(idx, 1);
        return { ok: true };
      },
      "browser.setActive": ({ tabId }: any) => {
        fakeTabs.forEach((tab) => (tab.active = tab.id === tabId));
        return { ok: true };
      },
      "browser.navigate": ({ tabId, url }: any) => {
        const tab = fakeTabs.find((t) => t.id === tabId);
        if (tab) tab.url = url;
        return { ok: true };
      },
      "browser.back": () => ({ ok: true }),
      "browser.forward": () => ({ ok: true }),
      "browser.reload": () => ({ ok: true }),
      "browser.readText": ({ tabId }: any) => ({
        tabId,
        text: "Mocked visible page text. Connect Reflex OS to read live tab content.",
      }),
      "browser.readOutline": ({ tabId }: any) => ({
        tabId,
        outline: [
          {
            tag: "main",
            children: [
              { tag: "h1", text: "Welcome" },
              { tag: "a", text: "Docs", href: "https://example.com/docs" },
            ],
          },
        ],
      }),
      "browser.screenshot": ({ tabId }: any) => ({
        tab_id: tabId,
        image:
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgAAIAAAUAAen63NgAAAAASUVORK5CYII=",
      }),
      "events.subscribe": () => ({ ok: true }),
      "events.unsubscribe": () => ({ ok: true }),
      "events.recent": () => [],
      "permissions.requests": () => [],
    },
  },
});

function App() {
  const [activeTabId, setActiveTabId] = React.useState<string | null>(null);
  return (
    <AppShell
      title="Browser Tab Monitor"
      subtitle="Wrap browser sidecar tabs and watch related events in one place."
    >
      <Section title="Tabs">
        <BrowserTabBar onActiveTabChange={setActiveTabId} />
      </Section>
      <SplitGrid template="minmax(360px,1.4fr) minmax(280px,1fr)">
        <Section title="Snapshot">
          <BrowserSnapshotView tabId={activeTabId} />
        </Section>
        <Section title="Browser events" description="Topic ‘browser.tabs’ — fed by your own utilities.">
          <EventLog topic="browser.tabs" />
        </Section>
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
