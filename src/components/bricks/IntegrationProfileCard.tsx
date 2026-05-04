import * as React from "react";
import { useBridge } from "../../react/ReflexProvider";
import {
  useIntegrationMcpStatus,
  useIntegrationProfile,
} from "../../react/useIntegration";
import { Badge } from "../primitives/Badge";
import { Button } from "../primitives/Button";
import { Card } from "../primitives/Card";
import { JsonView } from "../primitives/JsonView";
import { StatusLine, type StatusTone } from "../primitives/StatusLine";
import { Toolbar } from "../primitives/Toolbar";
import { cn } from "../cn";

export interface IntegrationProfileCardProps {
  /** Tab id to learn from. Optional — host falls back to the active tab. */
  tabId?: string;
  serviceUrl?: string;
  className?: string;
}

/**
 * Connected-app adapter dashboard. Surfaces `integration.profile`,
 * `learnVisible`, and `mcpStatus` in one card so a Connected App utility can
 * stitch together its visible-text learner and MCP status without writing
 * the bridge calls inline.
 */
export function IntegrationProfileCard({
  tabId,
  serviceUrl,
  className,
}: IntegrationProfileCardProps) {
  const bridge = useBridge();
  const profile = useIntegrationProfile();
  const mcp = useIntegrationMcpStatus({ includeConfig: false });
  const [status, setStatus] = React.useState<{ message: string; tone: StatusTone } | null>(null);
  const [learning, setLearning] = React.useState(false);

  async function learn() {
    setLearning(true);
    setStatus(null);
    try {
      const params: Parameters<typeof bridge.integration.learnVisible>[0] = {};
      if (tabId) params.tabId = tabId;
      if (serviceUrl) params.serviceUrl = serviceUrl;
      const result = await bridge.integration.learnVisible(params);
      setStatus({
        message: result.saved ? "Learned profile saved." : "Profile updated.",
        tone: "ok",
      });
      await profile.reload();
    } catch (err) {
      setStatus({
        message: err instanceof Error ? err.message : String(err),
        tone: "danger",
      });
    } finally {
      setLearning(false);
    }
  }

  return (
    <Card className={cn("grid gap-3", className)}>
      <header className="flex items-baseline gap-2 justify-between">
        <h3 className="text-sm font-medium">Connected app profile</h3>
        <div className="flex gap-1.5">
          {profile.data?.integration && <Badge tone="ok">integration</Badge>}
          {profile.data?.external && <Badge tone="info">external</Badge>}
        </div>
      </header>
      {profile.loading && !profile.data ? (
        <div className="text-xs text-reflex-fg-muted">Loading profile…</div>
      ) : profile.error ? (
        <StatusLine tone="danger">{String(profile.error)}</StatusLine>
      ) : (
        <JsonView value={profile.data ?? {}} defaultDepth={1} className="max-h-[40vh]" />
      )}
      <Toolbar>
        <Button variant="primary" onClick={learn} loading={learning}>
          Learn from visible text
        </Button>
        <Button variant="ghost" onClick={() => void profile.reload()}>
          Refresh
        </Button>
        {status && <StatusLine tone={status.tone}>{status.message}</StatusLine>}
      </Toolbar>
      <section className="grid gap-2">
        <h4 className="text-xs uppercase tracking-wider text-reflex-fg-muted">MCP status</h4>
        {mcp.loading && !mcp.data ? (
          <div className="text-xs text-reflex-fg-muted">Loading MCP status…</div>
        ) : (mcp.data ?? []).length === 0 ? (
          <p className="text-xs text-reflex-fg-muted">No MCP servers configured.</p>
        ) : (
          <ul className="grid gap-1.5">
            {(mcp.data ?? []).map((entry, idx) => (
              <li
                key={(entry.server_name ?? entry.provider ?? "") + idx}
                className="flex items-baseline gap-2 justify-between text-xs bg-reflex-surface-2 border border-reflex-border rounded px-2 py-1"
              >
                <span className="font-mono">
                  {entry.provider ?? "—"} / {entry.server_name ?? "—"}
                </span>
                <Badge tone={entry.reachable ? "ok" : entry.configured ? "warn" : "neutral"}>
                  {entry.reachable ? "reachable" : entry.configured ? "configured" : "missing"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Card>
  );
}
