import * as React from "react";
import { useSecretScopes, useSecrets } from "../../react/useSecrets";
import { useBridge } from "../../react/ReflexProvider";
import type { SecretScope } from "../../bridge/secrets";
import { Badge } from "../primitives/Badge";
import { Button } from "../primitives/Button";
import { Card } from "../primitives/Card";
import { EmptyState } from "../primitives/EmptyState";
import { Field, Input, Select } from "../primitives/Field";
import { StatusLine, type StatusTone } from "../primitives/StatusLine";
import { Toolbar } from "../primitives/Toolbar";
import { cn } from "../cn";

export interface SecretsManagerProps {
  /** Restrict UI to a single scope. Omit to let the user pick. */
  fixedScope?: SecretScope;
  /** Restrict UI to a single project. */
  fixedProjectId?: string;
  className?: string;
}

/**
 * Two-pane secrets manager: scope picker + key list + add/update form. Hides
 * values by default — users hit "Reveal" to surface a single value, which
 * then resets back to masked when the row loses focus.
 *
 * Use {@link RequireSecrets} when you only want a small "set this missing
 * key" banner, not the full editor.
 */
export function SecretsManager({
  fixedScope,
  fixedProjectId,
  className,
}: SecretsManagerProps) {
  const bridge = useBridge();
  const scopesResult = useSecretScopes();
  const projectOptions = React.useMemo(() => {
    const projectScope = (scopesResult.data?.scopes ?? []).find(
      (s) => s.scope === "project",
    );
    return projectScope?.projects ?? [];
  }, [scopesResult.data]);

  const [scope, setScope] = React.useState<SecretScope>(fixedScope ?? "project");
  const [projectId, setProjectId] = React.useState<string | undefined>(fixedProjectId);

  React.useEffect(() => {
    if (scope === "project" && !projectId && projectOptions.length > 0) {
      setProjectId(projectOptions[0]?.id);
    }
  }, [scope, projectId, projectOptions]);

  const enabled = scope !== "project" || !!projectId;
  const { data, loading, error, get, set, remove, reload } = useSecrets({
    scope,
    ...(projectId && scope === "project" ? { projectId } : {}),
    enabled,
  });

  const [draftKey, setDraftKey] = React.useState("");
  const [draftValue, setDraftValue] = React.useState("");
  const [revealed, setRevealed] = React.useState<{ key: string; value: string } | null>(null);
  const [status, setStatus] = React.useState<{ message: string; tone: StatusTone } | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function handleSave() {
    if (!draftKey.trim()) return;
    setBusy(true);
    setStatus(null);
    try {
      await set(draftKey.trim(), draftValue);
      setStatus({ message: `Saved ${draftKey.trim()}.`, tone: "ok" });
      setDraftKey("");
      setDraftValue("");
    } catch (err) {
      setStatus({
        message: err instanceof Error ? err.message : String(err),
        tone: "danger",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleReveal(key: string) {
    if (revealed?.key === key) {
      setRevealed(null);
      return;
    }
    setStatus(null);
    try {
      const out = await get(key);
      setRevealed({ key, value: out.value });
    } catch (err) {
      setStatus({
        message: err instanceof Error ? err.message : String(err),
        tone: "danger",
      });
    }
  }

  async function handleDelete(key: string) {
    if (!confirm(`Delete secret "${key}"? This cannot be undone.`)) return;
    setStatus(null);
    try {
      await remove(key);
      setStatus({ message: `Deleted ${key}.`, tone: "ok" });
      if (revealed?.key === key) setRevealed(null);
    } catch (err) {
      setStatus({
        message: err instanceof Error ? err.message : String(err),
        tone: "danger",
      });
    }
  }

  const entries = data ?? [];

  return (
    <Card className={cn("grid gap-3", className)}>
      <header className="grid gap-2 sm:grid-cols-2">
        {!fixedScope && (
          <Field label="Scope">
            <Select
              value={scope}
              onChange={(event) => setScope(event.target.value as SecretScope)}
            >
              <option value="project">Project</option>
              <option value="global">Global</option>
            </Select>
          </Field>
        )}
        {scope === "project" && !fixedProjectId && (
          <Field label="Project">
            <Select
              value={projectId ?? ""}
              onChange={(event) => setProjectId(event.target.value || undefined)}
              disabled={projectOptions.length === 0}
            >
              {projectOptions.length === 0 && <option value="">No linked projects</option>}
              {projectOptions.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </header>

      <section className="grid gap-2">
        <h3 className="text-xs uppercase tracking-wider text-reflex-fg-muted">Add or update</h3>
        <Toolbar>
          <Field label="Key" className="flex-1 min-w-[200px]">
            <Input
              value={draftKey}
              onChange={(event) => setDraftKey(event.target.value)}
              placeholder="OPENAI_API_KEY"
              autoComplete="off"
            />
          </Field>
          <Field label="Value" className="flex-1 min-w-[200px]">
            <Input
              type="password"
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              placeholder="sk-…"
              autoComplete="new-password"
            />
          </Field>
          <Button
            variant="primary"
            onClick={() => void handleSave()}
            loading={busy}
            disabled={!draftKey.trim() || !enabled}
            className="self-end"
          >
            Save
          </Button>
        </Toolbar>
      </section>

      <section className="grid gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-wider text-reflex-fg-muted">
            Stored ({entries.length})
          </h3>
          <Button size="sm" variant="ghost" onClick={() => void reload()}>
            Reload
          </Button>
        </div>
        {error ? (
          <StatusLine tone="danger">{String(error)}</StatusLine>
        ) : loading && !data ? (
          <div className="text-xs text-reflex-fg-muted">Loading…</div>
        ) : entries.length === 0 ? (
          <EmptyState
            title="No secrets in this scope"
            description="Use the form above to store one."
          />
        ) : (
          <ul className="grid gap-1.5">
            {entries.map((entry) => (
              <li
                key={entry.key}
                className="grid gap-1 bg-reflex-surface-2 border border-reflex-border rounded p-2"
              >
                <div className="flex items-center gap-2 justify-between">
                  <div className="grid gap-0.5 min-w-0">
                    <span className="font-mono text-sm break-all">{entry.key}</span>
                    <span className="text-xxs text-reflex-fg-faint">
                      {entry.scope === "project" ? `project:${entry.project_id}` : "global"} ·
                      updated {new Date(entry.updated_at_ms).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => void handleReveal(entry.key)}>
                      {revealed?.key === entry.key ? "Hide" : "Reveal"}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => void handleDelete(entry.key)}>
                      Delete
                    </Button>
                  </div>
                </div>
                {revealed?.key === entry.key && (
                  <div className="font-mono text-xs bg-reflex-bg border border-reflex-border rounded px-2 py-1 break-all">
                    {revealed.value}
                  </div>
                )}
                {entry.source_app_id && (
                  <Badge tone="neutral" className="self-start">
                    set by {entry.source_app_id}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {status && <StatusLine tone={status.tone}>{status.message}</StatusLine>}
    </Card>
  );
}
