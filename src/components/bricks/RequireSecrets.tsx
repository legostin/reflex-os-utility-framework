import * as React from "react";
import { useBridge } from "../../react/ReflexProvider";
import { Badge } from "../primitives/Badge";
import { Button } from "../primitives/Button";
import { Card } from "../primitives/Card";
import { Field, Input } from "../primitives/Field";
import { StatusLine, type StatusTone } from "../primitives/StatusLine";
import { Toolbar } from "../primitives/Toolbar";
import { cn } from "../cn";

export interface RequiredSecretSpec {
  key: string;
  /** Where to write a freshly-set value. Defaults to "project". */
  writeScope?: "project" | "global";
  /** Override the project to write to. Otherwise falls back to a single linked project. */
  writeProjectId?: string;
  /** Help text shown next to the input. */
  description?: string;
  /** Placeholder. Defaults to a generic mask. */
  placeholder?: string;
}

export interface RequireSecretsProps {
  /** The secrets the utility cannot run without. */
  required: RequiredSecretSpec[];
  className?: string;
  /**
   * Render children only after every required secret resolves successfully.
   * The default mode shows the children alongside an inline banner so the
   * utility stays partially usable.
   */
  blocking?: boolean;
  children?: React.ReactNode;
}

interface CheckState {
  loading: boolean;
  missing: RequiredSecretSpec[];
  drafts: Record<string, string>;
  status: { message: string; tone: StatusTone } | null;
  busyKey: string | null;
}

/**
 * "You need to set X before this utility can run" banner. For each required
 * key, calls `secrets.has` (linked-project + global cascade), shows the keys
 * that are missing, and provides an inline form to set each one. Pairs with
 * `useSecretValue` for actually consuming the secret value.
 */
export function RequireSecrets({
  required,
  className,
  blocking = false,
  children,
}: RequireSecretsProps) {
  const bridge = useBridge();
  const [state, setState] = React.useState<CheckState>({
    loading: true,
    missing: [],
    drafts: {},
    status: null,
    busyKey: null,
  });

  const requirements = React.useMemo(
    () => required.map((spec) => ({ ...spec, writeScope: spec.writeScope ?? "project" })),
    [required],
  );

  const reload = React.useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, status: null }));
    const missing: RequiredSecretSpec[] = [];
    for (const spec of requirements) {
      try {
        const result = await bridge.secrets.resolve({ key: spec.key });
        if (!("found" in result) || !result.found) {
          missing.push(spec);
        }
      } catch {
        missing.push(spec);
      }
    }
    setState((prev) => ({
      ...prev,
      loading: false,
      missing,
    }));
  }, [bridge, requirements]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  async function save(spec: RequiredSecretSpec) {
    const value = state.drafts[spec.key]?.trim();
    if (!value) return;
    setState((prev) => ({ ...prev, busyKey: spec.key, status: null }));
    try {
      const params: Parameters<typeof bridge.secrets.set>[0] = {
        scope: spec.writeScope ?? "project",
        key: spec.key,
        value,
      };
      if (spec.writeProjectId) params.projectId = spec.writeProjectId;
      await bridge.secrets.set(params);
      setState((prev) => ({
        ...prev,
        drafts: { ...prev.drafts, [spec.key]: "" },
        status: { message: `Saved ${spec.key}.`, tone: "ok" },
        busyKey: null,
      }));
      await reload();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: {
          message: error instanceof Error ? error.message : String(error),
          tone: "danger",
        },
        busyKey: null,
      }));
    }
  }

  const ready = !state.loading && state.missing.length === 0;

  if (ready) {
    return <>{children}</>;
  }

  const banner = (
    <Card className={cn("grid gap-3 border-reflex-warn/40 bg-reflex-warn/5", className)}>
      <header className="flex items-center gap-2">
        <Badge tone="warn">Setup required</Badge>
        <span className="text-sm text-reflex-fg-soft">
          This utility needs {state.missing.length === 1 ? "a secret" : `${state.missing.length} secrets`} before it can run.
        </span>
      </header>
      <ul className="grid gap-2">
        {state.missing.map((spec) => (
          <li
            key={spec.key}
            className="grid gap-1 p-2 rounded bg-reflex-surface-2 border border-reflex-border"
          >
            <div className="flex items-baseline gap-2 justify-between">
              <span className="font-mono text-sm">{spec.key}</span>
              <Badge tone="neutral">{spec.writeScope ?? "project"}</Badge>
            </div>
            {spec.description && (
              <p className="text-xs text-reflex-fg-muted">{spec.description}</p>
            )}
            <Toolbar>
              <Field label="Value" className="flex-1">
                <Input
                  type="password"
                  value={state.drafts[spec.key] ?? ""}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      drafts: { ...prev.drafts, [spec.key]: event.target.value },
                    }))
                  }
                  placeholder={spec.placeholder ?? "secret value"}
                  autoComplete="new-password"
                />
              </Field>
              <Button
                variant="primary"
                onClick={() => void save(spec)}
                loading={state.busyKey === spec.key}
                disabled={!state.drafts[spec.key]?.trim()}
                className="self-end"
              >
                Save
              </Button>
            </Toolbar>
          </li>
        ))}
      </ul>
      {state.status && <StatusLine tone={state.status.tone}>{state.status.message}</StatusLine>}
    </Card>
  );

  if (blocking) return banner;

  return (
    <div className="grid gap-3">
      {banner}
      {children}
    </div>
  );
}
