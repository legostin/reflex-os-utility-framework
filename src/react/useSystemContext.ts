import { useBridge } from "./ReflexProvider";
import { useAsync } from "./useAsync";

export function useSystemContext() {
  const bridge = useBridge();
  return useAsync(() => bridge.system.context(), []);
}

export function useManifest() {
  const bridge = useBridge();
  return useAsync(() => bridge.manifest.get(), []);
}

export function useBridgeCatalog() {
  const bridge = useBridge();
  return useAsync(() => bridge.system.bridgeCatalog(), []);
}

export function useProjects(includeAll = false) {
  const bridge = useBridge();
  return useAsync(() => bridge.projects.list({ includeAll }), [includeAll]);
}
