import * as React from "react";
import { useBridge } from "./ReflexProvider";
import { useAsync } from "./useAsync";
import type { SkillsByProject } from "../bridge/types";

export function useSkills(params: { projectId?: string; includeAll?: boolean } = {}) {
  const bridge = useBridge();
  const result = useAsync<SkillsByProject[]>(
    () => bridge.skills.list(params),
    [params.projectId ?? null, params.includeAll ?? false],
  );

  const ensure = React.useCallback(
    async (input: { projectId?: string; skill?: string; skills?: string[] }) => {
      const out = await bridge.skills.ensure(input);
      await result.reload();
      return out;
    },
    [bridge, result.reload],
  );

  const revoke = React.useCallback(
    async (input: { projectId?: string; skill?: string; skills?: string[] }) => {
      const out = await bridge.skills.revoke(input);
      await result.reload();
      return out;
    },
    [bridge, result.reload],
  );

  return { ...result, ensure, revoke };
}
