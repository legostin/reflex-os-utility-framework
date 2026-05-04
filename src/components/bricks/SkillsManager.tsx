import * as React from "react";
import { useSkills } from "../../react/useSkills";
import { Badge } from "../primitives/Badge";
import { Button } from "../primitives/Button";
import { Card } from "../primitives/Card";
import { EmptyState } from "../primitives/EmptyState";
import { Field, Input } from "../primitives/Field";
import { StatusLine, type StatusTone } from "../primitives/StatusLine";
import { Toolbar } from "../primitives/Toolbar";
import { cn } from "../cn";

export interface SkillsManagerProps {
  /** Limit to a specific project. Omit to show every linked project. */
  projectId?: string;
  includeAll?: boolean;
  className?: string;
}

/**
 * Read + ensure + revoke project skills. One row per project, each with an
 * inline add field and chip-style remove buttons.
 */
export function SkillsManager({ projectId, includeAll, className }: SkillsManagerProps) {
  const { data, loading, error, ensure, revoke } = useSkills({
    ...(projectId !== undefined ? { projectId } : {}),
    ...(includeAll !== undefined ? { includeAll } : {}),
  });
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});
  const [status, setStatus] = React.useState<{ message: string; tone: StatusTone } | null>(null);

  if (loading && !data) {
    return <div className={cn("text-xs text-reflex-fg-muted", className)}>Loading skills…</div>;
  }

  if (error) {
    return <div className={cn("text-xs text-reflex-danger", className)}>{String(error)}</div>;
  }

  const rows = data ?? [];
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No projects"
        description="Link a project to manage its preferred skills."
        className={className}
      />
    );
  }

  async function add(target: string) {
    const skill = (drafts[target] ?? "").trim();
    if (!skill) return;
    setStatus(null);
    try {
      await ensure({ projectId: target, skills: [skill] });
      setDrafts((prev) => ({ ...prev, [target]: "" }));
      setStatus({ message: `Added “${skill}”.`, tone: "ok" });
    } catch (err) {
      setStatus({
        message: err instanceof Error ? err.message : String(err),
        tone: "danger",
      });
    }
  }

  async function remove(target: string, skill: string) {
    setStatus(null);
    try {
      await revoke({ projectId: target, skills: [skill] });
      setStatus({ message: `Removed “${skill}”.`, tone: "ok" });
    } catch (err) {
      setStatus({
        message: err instanceof Error ? err.message : String(err),
        tone: "danger",
      });
    }
  }

  return (
    <div className={cn("grid gap-3", className)}>
      {rows.map((row) => (
        <Card key={row.project_id} className="grid gap-2">
          <header className="flex items-baseline gap-2">
            <h3 className="text-sm font-medium text-reflex-fg">{row.project_name ?? row.project_id}</h3>
            <span className="text-xxs text-reflex-fg-faint font-mono">{row.project_id}</span>
          </header>
          {row.skills.length === 0 ? (
            <p className="text-xs text-reflex-fg-muted">No skills pinned.</p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {row.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-reflex-surface-3 border border-reflex-border rounded-sm text-xs"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${skill}`}
                    className="text-reflex-fg-faint hover:text-reflex-danger"
                    onClick={() => void remove(row.project_id, skill)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          <Toolbar>
            <Field label="Add skill" className="flex-1">
              <Input
                value={drafts[row.project_id] ?? ""}
                onChange={(event) =>
                  setDrafts((prev) => ({ ...prev, [row.project_id]: event.target.value }))
                }
                placeholder="reflex-utility-framework"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void add(row.project_id);
                  }
                }}
              />
            </Field>
            <Button
              variant="primary"
              onClick={() => void add(row.project_id)}
              className="self-end"
            >
              Add
            </Button>
          </Toolbar>
        </Card>
      ))}
      {status && <StatusLine tone={status.tone}>{status.message}</StatusLine>}
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="info">Tip</Badge>
        <span className="text-xs text-reflex-fg-muted">
          Skill names match Codex CLI skill ids — keep them lowercase, kebab-case.
        </span>
      </div>
    </div>
  );
}
