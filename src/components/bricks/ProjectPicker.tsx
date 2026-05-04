import * as React from "react";
import { useProjects } from "../../react/useSystemContext";
import { Select } from "../primitives/Field";
import { cn } from "../cn";

export interface ProjectPickerProps {
  value: string | "global" | undefined;
  onChange: (value: string | "global") => void;
  /** Show a "Global memory" option above project list. */
  includeGlobal?: boolean;
  globalLabel?: string;
  includeAll?: boolean;
  className?: string;
  id?: string;
}

/**
 * Drop-in `<select>` populated from `projects.list`. Stores the project id (or
 * "global") on the parent. Loads once and silently surfaces nothing while the
 * bridge resolves so it never flickers a blank dropdown.
 */
export function ProjectPicker({
  value,
  onChange,
  includeGlobal,
  globalLabel = "Global memory",
  includeAll = false,
  className,
  id,
}: ProjectPickerProps) {
  const { data, loading } = useProjects(includeAll);
  const projects = data ?? [];

  return (
    <Select
      id={id}
      className={cn(className)}
      value={value ?? (includeGlobal ? "global" : projects[0]?.id ?? "")}
      onChange={(event) => onChange(event.target.value as string)}
      disabled={loading && projects.length === 0}
    >
      {includeGlobal && <option value="global">{globalLabel}</option>}
      {projects.map((project) => (
        <option key={project.id} value={project.id}>
          {project.name ?? project.id}
        </option>
      ))}
    </Select>
  );
}
