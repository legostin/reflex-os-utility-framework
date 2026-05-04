import * as React from "react";
import { useBridge } from "../../react/ReflexProvider";
import type { MemoryKind, MemoryScope } from "../../bridge/types";
import { Button } from "../primitives/Button";
import { Field, Input, Select, Textarea } from "../primitives/Field";
import { StatusLine, type StatusTone } from "../primitives/StatusLine";
import { Toolbar } from "../primitives/Toolbar";
import { ProjectPicker } from "./ProjectPicker";

const KINDS: MemoryKind[] = ["fact", "feedback", "project", "reference", "user", "snippet"];

export interface MemoryComposerProps {
  defaultScope?: MemoryScope;
  defaultProjectId?: string;
  defaultKind?: MemoryKind;
  /** Tag the source so audit trails know which utility wrote the note. */
  source?: string;
  /** Called after a successful save (optimistic listeners can refetch). */
  onSaved?: () => void;
  /** Override the submit button label. */
  submitLabel?: string;
  className?: string;
}

/**
 * Standardised "Save memory" form. Wraps `memory.save` with sensible defaults:
 * project/global toggle, kind selection, comma-separated tags, and a textarea
 * body. Keeps user input local; emits a status message and calls `onSaved`.
 */
export function MemoryComposer({
  defaultScope = "project",
  defaultProjectId,
  defaultKind = "fact",
  source,
  onSaved,
  submitLabel = "Save memory",
  className,
}: MemoryComposerProps) {
  const bridge = useBridge();
  const [scope, setScope] = React.useState<MemoryScope>(defaultScope);
  const [projectId, setProjectId] = React.useState<string | "global" | undefined>(
    defaultProjectId,
  );
  const [kind, setKind] = React.useState<MemoryKind>(defaultKind);
  const [name, setName] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [body, setBody] = React.useState("");
  const [status, setStatus] = React.useState<{ message: string; tone: StatusTone } | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function submit() {
    if (!body.trim()) {
      setStatus({ message: "Body is required.", tone: "warn" });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const params: Parameters<typeof bridge.memory.save>[0] = {
        scope,
        kind,
        name: name.trim() || "Untitled note",
        body,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (source) params.source = source;
      if (scope === "project" && projectId && projectId !== "global") {
        params.projectId = projectId;
      }
      await bridge.memory.save(params);
      setStatus({ message: "Saved.", tone: "ok" });
      setName("");
      setBody("");
      setTags("");
      onSaved?.();
    } catch (error) {
      setStatus({
        message: error instanceof Error ? error.message : String(error),
        tone: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <div className="grid gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Scope">
            <Select value={scope} onChange={(event) => setScope(event.target.value as MemoryScope)}>
              <option value="project">Project</option>
              <option value="global">Global</option>
              <option value="topic">Topic</option>
            </Select>
          </Field>
          <Field label="Kind">
            <Select value={kind} onChange={(event) => setKind(event.target.value as MemoryKind)}>
              {KINDS.map((k) => (
                <option key={String(k)} value={String(k)}>
                  {String(k)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {scope === "project" && (
          <Field label="Project">
            <ProjectPicker
              value={projectId}
              onChange={(value) => setProjectId(value)}
              includeGlobal={false}
            />
          </Field>
        )}
        <Field label="Name">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Short title"
          />
        </Field>
        <Field label="Tags" description="Comma-separated.">
          <Input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="planning, follow-up"
          />
        </Field>
        <Field label="Body">
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="What should be remembered, and why?"
            rows={6}
          />
        </Field>
        <Toolbar>
          <Button variant="primary" loading={loading} onClick={submit}>
            {submitLabel}
          </Button>
          {status && <StatusLine tone={status.tone}>{status.message}</StatusLine>}
        </Toolbar>
      </div>
    </div>
  );
}
