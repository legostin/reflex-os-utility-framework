import * as React from "react";

export interface AsyncState<T> {
  data: T | undefined;
  error: unknown;
  loading: boolean;
}

export interface UseAsyncResult<T> extends AsyncState<T> {
  reload: () => Promise<void>;
  setData: (next: T | undefined) => void;
}

/**
 * Minimal SWR-style loader. Re-runs when `deps` change, exposes the latest
 * data/error/loading triplet, and lets callers patch the cache via `setData`
 * after a mutation without re-fetching. Intentionally not a full request
 * library — the bridge methods are cheap and the host caches what it should.
 */
export function useAsync<T>(
  loader: () => Promise<T>,
  deps: React.DependencyList,
): UseAsyncResult<T> {
  const [state, setState] = React.useState<AsyncState<T>>({
    data: undefined,
    error: null,
    loading: true,
  });
  const tokenRef = React.useRef(0);
  const loaderRef = React.useRef(loader);
  loaderRef.current = loader;

  const run = React.useCallback(async () => {
    const token = ++tokenRef.current;
    setState((prev) => ({ data: prev.data, error: null, loading: true }));
    try {
      const data = await loaderRef.current();
      if (tokenRef.current === token) {
        setState({ data, error: null, loading: false });
      }
    } catch (error) {
      if (tokenRef.current === token) {
        setState({ data: undefined, error, loading: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const setData = React.useCallback((next: T | undefined) => {
    setState((prev) => ({ ...prev, data: next }));
  }, []);

  return { ...state, reload: run, setData };
}
