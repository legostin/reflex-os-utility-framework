import * as React from "react";
import { useAppDiff } from "../../react/useApps";
import { Badge } from "../primitives/Badge";
import { Card } from "../primitives/Card";
import { EmptyState } from "../primitives/EmptyState";
import { cn } from "../cn";

export interface AppDiffViewProps {
  appId: string | undefined;
  className?: string;
}

/**
 * Read-only render of `apps.diff`. We intentionally don't ship a syntax
 * highlighter — the unified diff is short enough for monospace and any
 * real diff viewer (CodeMirror, Monaco) is too heavy for this package.
 */
export function AppDiffView({ appId, className }: AppDiffViewProps) {
  const { data, loading, error } = useAppDiff(appId);

  if (!appId) {
    return (
      <EmptyState title="Pick an app" description="Select an app to see its working-tree diff." className={className} />
    );
  }
  if (loading && !data) {
    return <div className={cn("text-xs text-reflex-fg-muted", className)}>Loading diff…</div>;
  }
  if (error) {
    return <div className={cn("text-xs text-reflex-danger", className)}>{String(error)}</div>;
  }

  const diff = data?.diff ?? "";
  if (!diff.trim()) {
    return (
      <EmptyState
        title="Working tree is clean"
        description="No uncommitted changes for this app."
        className={className}
      />
    );
  }

  return (
    <Card className={cn("grid gap-2", className)} padded={false}>
      <header className="flex items-center gap-2 justify-between px-3 py-2 border-b border-reflex-border">
        <span className="text-xs font-mono text-reflex-fg-muted">{appId}</span>
        <Badge tone="warn">dirty</Badge>
      </header>
      <pre className="bg-reflex-bg font-mono text-xs leading-relaxed text-reflex-fg-soft overflow-auto px-3 pb-3 max-h-[480px] whitespace-pre">
        {diff
          .split("\n")
          .map((line, idx) => (
            <span
              key={idx}
              className={cn(
                "block",
                line.startsWith("+") && !line.startsWith("+++") && "text-reflex-ok",
                line.startsWith("-") && !line.startsWith("---") && "text-reflex-danger",
                line.startsWith("@@") && "text-reflex-link",
              )}
            >
              {line || " "}
            </span>
          ))}
      </pre>
    </Card>
  );
}
