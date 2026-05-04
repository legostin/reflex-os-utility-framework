import * as React from "react";
import { reflexInvoke } from "../../bridge/invoke";
import { Button } from "../primitives/Button";
import { Card } from "../primitives/Card";
import { Field, Textarea } from "../primitives/Field";
import { StatusLine } from "../primitives/StatusLine";
import { Toolbar } from "../primitives/Toolbar";
import { BridgeMethodPicker } from "./BridgeMethodPicker";
import { cn } from "../cn";

export interface ActionRunnerProps {
  /** Pin to a specific bridge method instead of letting the user pick. */
  method?: string;
  defaultParams?: Record<string, unknown>;
  className?: string;
  /** Hide the method picker (locks `method`). */
  lockMethod?: boolean;
  onResult?: (result: unknown) => void;
}

function safeJson(value: string): unknown {
  if (!value.trim()) return {};
  return JSON.parse(value);
}

/**
 * Generic bridge-method runner: pick a method, edit JSON params, execute, see
 * the result. Use this inside developer/power-user utilities to give the user
 * (and the agent during onboarding) a way to test grants without leaving the
 * panel.
 */
export function ActionRunner({
  method: pinned,
  defaultParams,
  className,
  lockMethod,
  onResult,
}: ActionRunnerProps) {
  const [method, setMethod] = React.useState(pinned ?? "");
  const [params, setParams] = React.useState(JSON.stringify(defaultParams ?? {}, null, 2));
  const [result, setResult] = React.useState<unknown>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const parsed = safeJson(params) as Record<string, any>;
      const out = await reflexInvoke(method, parsed);
      setResult(out);
      onResult?.(out);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className={cn("grid gap-3", className)}>
      {!lockMethod && (
        <BridgeMethodPicker value={method} onChange={setMethod} description="Any bridge.* id." />
      )}
      <Field label="Params (JSON)">
        <Textarea
          value={params}
          onChange={(event) => setParams(event.target.value)}
          rows={6}
          spellCheck={false}
          className="font-mono text-xs"
        />
      </Field>
      <Toolbar>
        <Button variant="primary" onClick={run} loading={loading} disabled={!method}>
          Run
        </Button>
        {error && <StatusLine tone="danger">{error}</StatusLine>}
      </Toolbar>
      {result !== null && (
        <div className="bg-reflex-bg border border-reflex-border rounded p-3 font-mono text-xs overflow-auto max-h-[320px]">
          <pre className="whitespace-pre-wrap break-words">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </Card>
  );
}
