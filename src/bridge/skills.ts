import { reflexInvoke } from "./invoke";
import type { SkillsByProject } from "./types";

/**
 * Project skills client. The bridge returns one row per project (linked
 * projects + others gated by `skills.read:*`). Mutations require
 * `skills.write:<project>` or `skills.write:*`.
 */
export const skills = {
  list(params: { projectId?: string; includeAll?: boolean } = {}) {
    return reflexInvoke<SkillsByProject[]>("skills.list", params);
  },
  ensure(params: { projectId?: string; skill?: string; skills?: string[] }) {
    return reflexInvoke<{ ok: boolean; added: string[]; skills: string[] }>(
      "project.skills.ensure",
      params,
    );
  },
  revoke(params: { projectId?: string; skill?: string; skills?: string[] }) {
    return reflexInvoke<{ ok: boolean; removed: string[]; skills: string[] }>(
      "project.skills.revoke",
      params,
    );
  },
} as const;

export type SkillsClient = typeof skills;
