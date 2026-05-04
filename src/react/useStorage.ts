import * as React from "react";
import { useBridge } from "./ReflexProvider";

/**
 * `useStorage` mirrors the bridge `storage.*` API but adopts a `useState`-like
 * shape. It performs a single read on mount, then `set` writes through to the
 * bridge and updates local state optimistically.
 */
export function useStorage<T>(key: string, fallback: T) {
  const bridge = useBridge();
  const [value, setValue] = React.useState<T>(fallback);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown>(null);

  const tokenRef = React.useRef(0);

  const load = React.useCallback(async () => {
    const token = ++tokenRef.current;
    setLoading(true);
    setError(null);
    try {
      const stored = await bridge.storage.get<T>(key, fallback);
      if (tokenRef.current === token) {
        setValue(stored as T);
        setLoading(false);
      }
    } catch (err) {
      if (tokenRef.current === token) {
        setError(err);
        setLoading(false);
      }
    }
  }, [bridge, key]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const update = React.useCallback(
    async (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const computed =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        bridge.storage.set(key, computed).catch((err) => setError(err));
        return computed;
      });
    },
    [bridge, key],
  );

  const remove = React.useCallback(async () => {
    setValue(fallback);
    return bridge.storage.delete(key);
  }, [bridge, key, fallback]);

  return { value, set: update, delete: remove, reload: load, loading, error };
}
