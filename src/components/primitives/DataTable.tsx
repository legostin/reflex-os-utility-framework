import * as React from "react";
import { cn } from "../cn";

export interface DataTableColumn<T> {
  id: string;
  header: React.ReactNode;
  /** Render the cell. Defaults to `String(row[id])`. */
  render?: (row: T) => React.ReactNode;
  className?: string;
  /** Pin width in px or any CSS length. */
  width?: number | string;
  align?: "left" | "right" | "center";
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  /** Stable row key. Defaults to `id`/`key`/index. */
  rowKey?: (row: T, index: number) => string;
  empty?: React.ReactNode;
  className?: string;
  onRowClick?: (row: T) => void;
  /** Highlight a single row by stable key. */
  activeKey?: string | null;
  /** Compact spacing. */
  dense?: boolean;
}

const ALIGN: Record<NonNullable<DataTableColumn<unknown>["align"]>, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty,
  className,
  onRowClick,
  activeKey,
  dense,
}: DataTableProps<T>) {
  const resolveKey = React.useCallback(
    (row: T, index: number) => {
      if (rowKey) return rowKey(row, index);
      const candidate = (row as { id?: unknown; key?: unknown }).id ??
        (row as { key?: unknown }).key;
      return candidate !== undefined ? String(candidate) : String(index);
    },
    [rowKey],
  );

  if (rows.length === 0 && empty) {
    return <div className={className}>{empty}</div>;
  }

  return (
    <div
      className={cn(
        "overflow-auto border border-reflex-border rounded-md bg-reflex-surface",
        className,
      )}
    >
      <table className="w-full text-sm">
        <thead className="bg-reflex-surface-2 text-xxs uppercase tracking-wider text-reflex-fg-muted">
          <tr>
            {columns.map((col) => (
              <th
                key={col.id}
                scope="col"
                className={cn(
                  "px-3 py-2 font-medium border-b border-reflex-border whitespace-nowrap",
                  ALIGN[col.align ?? "left"],
                  col.className,
                )}
                style={col.width !== undefined ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const key = resolveKey(row, index);
            const active = activeKey === key;
            return (
              <tr
                key={key}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-b border-reflex-border last:border-b-0",
                  onRowClick && "cursor-pointer hover:bg-reflex-surface-2",
                  active && "bg-reflex-surface-3",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={cn(
                      dense ? "px-3 py-1.5" : "px-3 py-2",
                      "align-top text-reflex-fg-soft",
                      ALIGN[col.align ?? "left"],
                      col.className,
                    )}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.id] ?? "")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
