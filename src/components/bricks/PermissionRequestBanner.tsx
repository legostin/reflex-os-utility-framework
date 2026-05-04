import * as React from "react";
import { useBridge } from "../../react/ReflexProvider";
import { useAsync } from "../../react/useAsync";
import { Button } from "../primitives/Button";
import { Badge } from "../primitives/Badge";
import { cn } from "../cn";

export interface PermissionRequestBannerProps {
  className?: string;
}

/**
 * Show a one-line banner when this app has pending permission requests. The
 * host renders an approval UI elsewhere; this brick only nudges the user when
 * an action is currently blocked.
 */
export function PermissionRequestBanner({ className }: PermissionRequestBannerProps) {
  const bridge = useBridge();
  const { data, reload } = useAsync(() => bridge.permissions.requests(), []);

  const pending = (data ?? []).filter((req) => (req.status ?? "pending") === "pending");
  if (pending.length === 0) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-3 bg-reflex-warn/10 border border-reflex-warn/30 rounded p-3",
        className,
      )}
    >
      <Badge tone="warn">Permission</Badge>
      <div className="grid gap-1 min-w-0 flex-1">
        <span className="text-sm text-reflex-fg-soft">
          {pending.length === 1
            ? "1 permission request is awaiting approval."
            : `${pending.length} permission requests are awaiting approval.`}
        </span>
        <ul className="text-xs text-reflex-fg-muted grid gap-0.5">
          {pending.slice(0, 3).map((request) => (
            <li key={request.id} className="truncate">
              {request.reason ?? request.permissions?.join(", ") ?? request.id}
            </li>
          ))}
        </ul>
      </div>
      <Button size="sm" variant="ghost" onClick={() => void reload()}>
        Refresh
      </Button>
    </div>
  );
}
