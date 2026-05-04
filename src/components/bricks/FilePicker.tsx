import * as React from "react";
import { useDialog } from "../../react/useNative";
import type { DialogFilter } from "../../bridge/types";
import { Button, type ButtonProps } from "../primitives/Button";

export interface FilePickerProps extends Omit<ButtonProps, "onClick"> {
  mode?: "directory" | "file" | "save";
  multiple?: boolean;
  title?: string;
  defaultPath?: string;
  filters?: DialogFilter[];
  onPick: (path: string | string[] | null) => void;
}

/**
 * Button that opens the native macOS picker via `dialog.*` and forwards the
 * picked path(s) to a callback. UI-only — these methods are blocked inside
 * scheduler steps.
 */
export function FilePicker({
  mode = "file",
  multiple,
  title,
  defaultPath,
  filters,
  onPick,
  children,
  ...rest
}: FilePickerProps) {
  const dialog = useDialog();
  const [busy, setBusy] = React.useState(false);

  async function open() {
    setBusy(true);
    try {
      const params: { title?: string; defaultPath?: string; multiple?: boolean; filters?: DialogFilter[] } = {};
      if (title) params.title = title;
      if (defaultPath) params.defaultPath = defaultPath;
      if (multiple !== undefined) params.multiple = multiple;
      if (filters) params.filters = filters;
      let picked: string | string[] | null;
      if (mode === "directory") picked = await dialog.openDirectory(params);
      else if (mode === "save") picked = await dialog.saveFile(params);
      else picked = await dialog.openFile(params);
      onPick(picked);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={open} loading={busy} {...rest}>
      {children ??
        (mode === "directory"
          ? "Pick directory"
          : mode === "save"
            ? "Save as…"
            : "Pick file")}
    </Button>
  );
}
