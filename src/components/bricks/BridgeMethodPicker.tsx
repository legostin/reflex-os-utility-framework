import * as React from "react";
import { useBridgeCatalog } from "../../react/useSystemContext";
import { Field, Input, Select } from "../primitives/Field";
import { cn } from "../cn";

export interface BridgeMethodPickerProps {
  value: string | undefined;
  onChange: (method: string) => void;
  filter?: string;
  className?: string;
  label?: string;
  description?: string;
}

/**
 * Catalog-driven method selector. Use it inside power-user / dev utilities so
 * the agent and the user share one canonical list of bridge methods.
 */
export function BridgeMethodPicker({
  value,
  onChange,
  filter,
  className,
  label = "Bridge method",
  description,
}: BridgeMethodPickerProps) {
  const { data, loading } = useBridgeCatalog();
  const [search, setSearch] = React.useState("");

  const methods = (data?.methods ?? []).filter((method) => {
    if (filter && !method.includes(filter)) return false;
    if (search && !method.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <Field label={label} description={description} className={className}>
      <div className={cn("grid gap-2 grid-cols-1 sm:grid-cols-[1fr_2fr]")}>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Filter…"
        />
        <Select
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          disabled={loading && methods.length === 0}
        >
          <option value="" disabled>
            {loading ? "Loading…" : "Pick a method"}
          </option>
          {methods.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
        </Select>
      </div>
    </Field>
  );
}
