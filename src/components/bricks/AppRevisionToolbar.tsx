import * as React from "react";
import { useBridge } from "../../react/ReflexProvider";
import { Button } from "../primitives/Button";
import { Field, Input } from "../primitives/Field";
import { StatusLine, type StatusTone } from "../primitives/StatusLine";
import { Toolbar } from "../primitives/Toolbar";
import { cn } from "../cn";

export interface AppRevisionToolbarProps {
  appId: string | undefined;
  className?: string;
  onRevised?: () => void;
}

/**
 * Commit / revert toolbar for the given app. Pairs with `<AppDiffView>` to
 * give the user a tiny git-style flow without leaving the host.
 */
export function AppRevisionToolbar({
  appId,
  className,
  onRevised,
}: AppRevisionToolbarProps) {
  const bridge = useBridge();
  const [message, setMessage] = React.useState("");
  const [status, setStatus] = React.useState<{ message: string; tone: StatusTone } | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function commit() {
    if (!appId) return;
    setStatus(null);
    setBusy(true);
    try {
      await bridge.apps.commit({ app_id: appId, message: message.trim() || undefined });
      setStatus({ message: "Committed.", tone: "ok" });
      setMessage("");
      onRevised?.();
    } catch (err) {
      setStatus({
        message: err instanceof Error ? err.message : String(err),
        tone: "danger",
      });
    } finally {
      setBusy(false);
    }
  }

  async function revert() {
    if (!appId) return;
    if (!confirm("Revert all uncommitted changes for this app?")) return;
    setStatus(null);
    setBusy(true);
    try {
      await bridge.apps.revert(appId);
      setStatus({ message: "Reverted.", tone: "ok" });
      onRevised?.();
    } catch (err) {
      setStatus({
        message: err instanceof Error ? err.message : String(err),
        tone: "danger",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Toolbar>
        <Field label="Commit message" className="flex-1">
          <Input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Describe the change"
          />
        </Field>
        <Button
          variant="primary"
          onClick={commit}
          loading={busy}
          disabled={!appId}
          className="self-end"
        >
          Commit
        </Button>
        <Button
          variant="danger"
          onClick={revert}
          disabled={!appId || busy}
          className="self-end"
        >
          Revert
        </Button>
      </Toolbar>
      {status && <StatusLine tone={status.tone}>{status.message}</StatusLine>}
    </div>
  );
}
