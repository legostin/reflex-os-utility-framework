import * as React from "react";
import { useBridge } from "../../react/ReflexProvider";
import type { BrowserOutlineNode } from "../../bridge/types";
import { Badge } from "../primitives/Badge";
import { Button } from "../primitives/Button";
import { Card } from "../primitives/Card";
import { EmptyState } from "../primitives/EmptyState";
import { Tab, TabList, TabPanel, Tabs } from "../primitives/Tabs";
import { Toolbar } from "../primitives/Toolbar";
import { cn } from "../cn";

export interface BrowserSnapshotViewProps {
  tabId: string | null | undefined;
  className?: string;
}

/**
 * Show three read-only snapshots of the active tab side by side: visible
 * text, outline tree, and a screenshot. Wraps `browser.readText`,
 * `browser.readOutline`, and `browser.screenshot`.
 */
export function BrowserSnapshotView({ tabId, className }: BrowserSnapshotViewProps) {
  const bridge = useBridge();
  const [text, setText] = React.useState<string | null>(null);
  const [outline, setOutline] = React.useState<BrowserOutlineNode[] | null>(null);
  const [screenshot, setScreenshot] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<unknown>(null);

  const refresh = React.useCallback(async () => {
    if (!tabId) return;
    setBusy(true);
    setError(null);
    try {
      const [textResult, outlineResult, screenshotResult] = await Promise.all([
        bridge.browser.readText(tabId),
        bridge.browser.readOutline(tabId),
        bridge.browser.screenshot({ tabId, fullPage: false }),
      ]);
      setText(textResult.text);
      setOutline(outlineResult.outline);
      setScreenshot(screenshotResult.image);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }, [bridge, tabId]);

  if (!tabId) {
    return (
      <EmptyState
        title="Pick a tab"
        description="Pick or open a tab above to inspect its visible content."
        className={className}
      />
    );
  }

  return (
    <Card className={cn("grid gap-3", className)}>
      <Toolbar>
        <Badge tone="info">{tabId}</Badge>
        <Button variant="primary" onClick={() => void refresh()} loading={busy}>
          Capture
        </Button>
        {error ? <span className="text-xs text-reflex-danger">{String(error)}</span> : null}
      </Toolbar>
      <Tabs defaultValue="text">
        <TabList>
          <Tab value="text">Text</Tab>
          <Tab value="outline">Outline</Tab>
          <Tab value="screenshot">Screenshot</Tab>
        </TabList>
        <TabPanel value="text">
          {text === null ? (
            <p className="text-xs text-reflex-fg-muted">Hit Capture to read the visible text.</p>
          ) : (
            <pre className="bg-reflex-bg border border-reflex-border rounded p-3 text-xs leading-relaxed text-reflex-fg-soft whitespace-pre-wrap max-h-[400px] overflow-auto">
              {text}
            </pre>
          )}
        </TabPanel>
        <TabPanel value="outline">
          {outline === null ? (
            <p className="text-xs text-reflex-fg-muted">No outline captured yet.</p>
          ) : (
            <div className="bg-reflex-bg border border-reflex-border rounded p-3 text-xs max-h-[400px] overflow-auto">
              <OutlineList nodes={outline} />
            </div>
          )}
        </TabPanel>
        <TabPanel value="screenshot">
          {screenshot ? (
            <img
              src={screenshot.startsWith("data:") ? screenshot : `data:image/png;base64,${screenshot}`}
              alt="Tab screenshot"
              className="max-w-full rounded border border-reflex-border"
            />
          ) : (
            <p className="text-xs text-reflex-fg-muted">Hit Capture to grab a screenshot.</p>
          )}
        </TabPanel>
      </Tabs>
    </Card>
  );
}

function OutlineList({ nodes, depth = 0 }: { nodes: BrowserOutlineNode[]; depth?: number }) {
  return (
    <ul className="grid gap-0.5">
      {nodes.map((node, idx) => (
        <li key={idx} className="grid gap-0.5">
          <div className="flex items-baseline gap-2" style={{ paddingLeft: depth * 12 }}>
            <span className="text-reflex-link font-mono">{node.tag ?? node.role ?? "node"}</span>
            {node.text && <span className="truncate text-reflex-fg-soft">{node.text}</span>}
            {node.href && (
              <span className="text-reflex-fg-faint font-mono truncate">{node.href}</span>
            )}
          </div>
          {node.children && node.children.length > 0 && (
            <OutlineList nodes={node.children} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}
