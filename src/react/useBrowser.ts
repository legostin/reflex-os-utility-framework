import * as React from "react";
import { useBridge } from "./ReflexProvider";
import type { BrowserTab } from "../bridge/types";

/**
 * High-level browser sidecar handle. One hook covers the common pattern of
 * "make sure the sidecar is up, list tabs, navigate one of them, read the
 * outline back."
 */
export function useBrowser(options: { autoInit?: boolean; pollIntervalMs?: number } = {}) {
  const { autoInit = true, pollIntervalMs = 0 } = options;
  const bridge = useBridge();
  const [tabs, setTabs] = React.useState<BrowserTab[]>([]);
  const [activeTabId, setActiveTabId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<unknown>(null);
  const [loading, setLoading] = React.useState(true);

  const reloadTabs = React.useCallback(async () => {
    try {
      const list = await bridge.browser.tabs();
      setTabs(list);
      setActiveTabId((current) => {
        if (current && list.some((tab) => tab.id === current)) return current;
        return list.find((tab) => tab.active)?.id ?? list[0]?.id ?? null;
      });
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }, [bridge]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (autoInit) await bridge.browser.init({});
        if (!cancelled) await reloadTabs();
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [autoInit, bridge, reloadTabs]);

  React.useEffect(() => {
    if (!pollIntervalMs) return undefined;
    const handle = setInterval(() => {
      void reloadTabs();
    }, pollIntervalMs);
    return () => clearInterval(handle);
  }, [pollIntervalMs, reloadTabs]);

  const open = React.useCallback(
    async (url: string, params: { projectId?: string } = {}) => {
      const tab = await bridge.browser.open(url, params);
      await reloadTabs();
      setActiveTabId(tab.id);
      return tab;
    },
    [bridge, reloadTabs],
  );

  const close = React.useCallback(
    async (tabId: string) => {
      await bridge.browser.close(tabId);
      await reloadTabs();
    },
    [bridge, reloadTabs],
  );

  const setActive = React.useCallback(
    async (tabId: string) => {
      await bridge.browser.setActive(tabId);
      setActiveTabId(tabId);
      await reloadTabs();
    },
    [bridge, reloadTabs],
  );

  const navigate = React.useCallback(
    async (tabId: string, url: string) => {
      await bridge.browser.navigate({ tabId, url });
      await reloadTabs();
    },
    [bridge, reloadTabs],
  );

  return {
    tabs,
    activeTabId,
    activeTab: tabs.find((tab) => tab.id === activeTabId) ?? null,
    loading,
    error,
    reloadTabs,
    open,
    close,
    setActive,
    navigate,
    api: bridge.browser,
  };
}
