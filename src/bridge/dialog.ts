import { reflexInvoke } from "./invoke";
import type { DialogOpenParams, DialogPathResult, DialogSaveParams } from "./types";

/**
 * Native macOS dialog client. UI-only — these methods are blocked inside
 * scheduler steps. Each call returns the picked path(s) or `null` when the
 * user cancels.
 */
export const dialog = {
  openDirectory(params: DialogOpenParams = {}) {
    return reflexInvoke<DialogPathResult>("dialog.openDirectory", params);
  },
  openFile(params: DialogOpenParams = {}) {
    return reflexInvoke<DialogPathResult>("dialog.openFile", params);
  },
  saveFile(params: DialogSaveParams = {}) {
    return reflexInvoke<string | null>("dialog.saveFile", params);
  },
} as const;

export type DialogClient = typeof dialog;
