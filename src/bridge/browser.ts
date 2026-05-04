import { reflexInvoke } from "./invoke";
import type { BrowserOutlineNode, BrowserScreenshot, BrowserTab } from "./types";

/**
 * Browser sidecar client. Wraps every `browser.*` and
 * `project.browser.setEnabled` bridge method.
 *
 * Read-only methods (`tabs`, `currentUrl`, `readText`, `readOutline`,
 * `screenshot`) require `browser.read`. Mutating methods require
 * `browser.control`. Cross-project tabs additionally require
 * `browser.project:<id>` or `browser.project:*`.
 */
export const browser = {
  init(params: { headless?: boolean; projectId?: string } = {}) {
    return reflexInvoke<{ ok: boolean }>("browser.init", params);
  },
  setProjectEnabled(params: { projectId: string; enabled: boolean }) {
    return reflexInvoke<{ ok: boolean }>("project.browser.setEnabled", params);
  },
  tabs() {
    return reflexInvoke<BrowserTab[]>("browser.tabs.list", {});
  },
  open(url: string, params: { projectId?: string } = {}) {
    return reflexInvoke<BrowserTab>("browser.open", { url, ...params });
  },
  close(tabId: string) {
    return reflexInvoke<{ ok: boolean }>("browser.close", { tabId });
  },
  setActive(tabId: string) {
    return reflexInvoke<{ ok: boolean }>("browser.setActive", { tabId });
  },
  navigate(params: { tabId: string; url: string }) {
    return reflexInvoke<{ ok: boolean }>("browser.navigate", params);
  },
  back(tabId: string) {
    return reflexInvoke<{ ok: boolean }>("browser.back", { tabId });
  },
  forward(tabId: string) {
    return reflexInvoke<{ ok: boolean }>("browser.forward", { tabId });
  },
  reload(tabId: string) {
    return reflexInvoke<{ ok: boolean }>("browser.reload", { tabId });
  },
  currentUrl(tabId: string) {
    return reflexInvoke<{ url: string; title?: string }>("browser.currentUrl", { tabId });
  },
  readText(tabId: string) {
    return reflexInvoke<{ tabId: string; text: string; truncated?: boolean }>(
      "browser.readText",
      { tabId },
    );
  },
  readOutline(tabId: string) {
    return reflexInvoke<{ tabId: string; outline: BrowserOutlineNode[] }>(
      "browser.readOutline",
      { tabId },
    );
  },
  screenshot(params: { tabId: string; fullPage?: boolean }) {
    return reflexInvoke<BrowserScreenshot>("browser.screenshot", params);
  },
  clickText(params: { tabId: string; text: string; exact?: boolean }) {
    return reflexInvoke<{ ok: boolean }>("browser.clickText", params);
  },
  clickSelector(params: { tabId: string; selector: string }) {
    return reflexInvoke<{ ok: boolean }>("browser.clickSelector", params);
  },
  fill(params: { tabId: string; selector: string; value: string }) {
    return reflexInvoke<{ ok: boolean }>("browser.fill", params);
  },
  scroll(params: { tabId: string; dx?: number; dy?: number }) {
    return reflexInvoke<{ ok: boolean }>("browser.scroll", params);
  },
  waitFor(params: { tabId: string; selector: string; timeoutMs?: number }) {
    return reflexInvoke<{ ok: boolean; matched?: boolean }>("browser.waitFor", params);
  },
} as const;

export type BrowserClient = typeof browser;
