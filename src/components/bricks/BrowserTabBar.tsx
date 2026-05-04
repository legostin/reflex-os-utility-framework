import * as React from "react";
import { useBrowser } from "../../react/useBrowser";
import { Button } from "../primitives/Button";
import { EmptyState } from "../primitives/EmptyState";
import { Field, Input } from "../primitives/Field";
import { StatusLine, type StatusTone } from "../primitives/StatusLine";
import { Toolbar } from "../primitives/Toolbar";
import { cn } from "../cn";

export interface BrowserTabBarProps {
  /** Project to scope tabs to. */
  projectId?: string;
  /** Auto-init the sidecar on mount. Defaults to true. */
  autoInit?: boolean;
  /** Notify the parent when the user switches the active tab. */
  onActiveTabChange?: (tabId: string | null) => void;
  className?: string;
}

/**
 * Tab strip + URL bar for the Reflex Browser sidecar. Wraps `browser.init`,
 * `browser.tabs.list`, `browser.open`, `browser.close`, `browser.setActive`,
 * and `browser.navigate` in a single component.
 */
export function BrowserTabBar({
  projectId,
  autoInit,
  onActiveTabChange,
  className,
}: BrowserTabBarProps) {
  const browser = useBrowser({ ...(autoInit !== undefined ? { autoInit } : {}) });
  const [url, setUrl] = React.useState("");
  const [status, setStatus] = React.useState<{ message: string; tone: StatusTone } | null>(null);

  React.useEffect(() => {
    onActiveTabChange?.(browser.activeTabId);
  }, [browser.activeTabId, onActiveTabChange]);

  React.useEffect(() => {
    setUrl(browser.activeTab?.url ?? "");
  }, [browser.activeTabId, browser.activeTab?.url]);

  async function go() {
    if (!url.trim()) return;
    setStatus(null);
    try {
      if (browser.activeTabId) {
        await browser.navigate(browser.activeTabId, url.trim());
      } else {
        await browser.open(url.trim(), projectId ? { projectId } : {});
      }
    } catch (err) {
      setStatus({
        message: err instanceof Error ? err.message : String(err),
        tone: "danger",
      });
    }
  }

  if (browser.loading && browser.tabs.length === 0) {
    return <div className={cn("text-xs text-reflex-fg-muted", className)}>Starting browser sidecar…</div>;
  }

  if (browser.error) {
    return <div className={cn("text-xs text-reflex-danger", className)}>{String(browser.error)}</div>;
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex flex-wrap gap-1">
        {browser.tabs.length === 0 && (
          <EmptyState
            title="No open tabs"
            description="Type a URL below to open one."
          />
        )}
        {browser.tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => void browser.setActive(tab.id)}
            className={cn(
              "inline-flex items-center gap-2 px-2.5 py-1 text-xs rounded-sm border",
              tab.id === browser.activeTabId
                ? "bg-reflex-surface-3 border-reflex-border-strong text-reflex-fg"
                : "bg-reflex-surface-2 border-reflex-border text-reflex-fg-soft hover:bg-reflex-surface-3",
            )}
          >
            <span className="truncate max-w-[180px]">{tab.title || tab.url}</span>
            <span
              role="button"
              aria-label="Close tab"
              onClick={(event) => {
                event.stopPropagation();
                void browser.close(tab.id);
              }}
              className="text-reflex-fg-faint hover:text-reflex-danger"
            >
              ×
            </span>
          </button>
        ))}
      </div>
      <Toolbar>
        <Field label="URL" className="flex-1">
          <Input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void go();
              }
            }}
          />
        </Field>
        <Button
          variant="primary"
          onClick={() => void go()}
          disabled={!url.trim()}
          className="self-end"
        >
          {browser.activeTabId ? "Go" : "Open"}
        </Button>
        {browser.activeTabId && (
          <>
            <Button
              variant="ghost"
              onClick={() => void browser.api.back(browser.activeTabId!)}
              className="self-end"
            >
              ← Back
            </Button>
            <Button
              variant="ghost"
              onClick={() => void browser.api.forward(browser.activeTabId!)}
              className="self-end"
            >
              Forward →
            </Button>
            <Button
              variant="subtle"
              onClick={() => void browser.api.reload(browser.activeTabId!)}
              className="self-end"
            >
              Reload
            </Button>
          </>
        )}
        {status && <StatusLine tone={status.tone}>{status.message}</StatusLine>}
      </Toolbar>
    </div>
  );
}
