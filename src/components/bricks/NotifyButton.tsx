import * as React from "react";
import { useNotify } from "../../react/useNative";
import { Button, type ButtonProps } from "../primitives/Button";

export interface NotifyButtonProps extends Omit<ButtonProps, "onClick"> {
  title: string;
  body?: string;
  onSent?: () => void;
}

/**
 * One-line `notify.show` trigger. Useful for "remind me" buttons inside
 * dashboards.
 */
export function NotifyButton({ title, body, onSent, children, ...rest }: NotifyButtonProps) {
  const notify = useNotify();
  const [busy, setBusy] = React.useState(false);

  async function send() {
    setBusy(true);
    try {
      const params: { title: string; body?: string } = { title };
      if (body !== undefined) params.body = body;
      await notify(params);
      onSent?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={send} loading={busy} {...rest}>
      {children ?? "Notify"}
    </Button>
  );
}
