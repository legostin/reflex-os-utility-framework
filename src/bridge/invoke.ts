/**
 * Low-level Reflex bridge invoker.
 *
 * Inside a Reflex utility iframe the host injects `window.reflexInvoke` and a
 * family of `window.reflex*` helpers. We wrap those so consumers get a typed,
 * promise-based API and a deterministic fallback path: when the host helpers
 * are missing (e.g. the utility runs standalone in a browser tab during local
 * development) we replay the same `postMessage` contract and surface a hookable
 * mock layer.
 */

export type ReflexBridgeMethod = string;

// We deliberately accept any object-shaped payload — strict typing happens at
// the per-method client wrappers (memory, agent, etc.), not here.
export type ReflexBridgePayload = Record<string, any> | undefined;

export type ReflexInvokeFn = <T = unknown>(
  method: ReflexBridgeMethod,
  params?: ReflexBridgePayload,
) => Promise<T>;

export interface ReflexBridgeMock {
  invoke?: ReflexInvokeFn;
  /** Per-method handlers keyed by bridge method id, e.g. "memory.list". */
  handlers?: Record<string, (params: any) => unknown | Promise<unknown>>;
}

export interface ReflexBridgeOptions {
  /** Override the global `window.reflexInvoke` lookup (tests, SSR). */
  invoke?: ReflexInvokeFn;
  /** Mock data for environments without the host runtime. */
  mock?: ReflexBridgeMock;
  /** Throw if no transport found (default true). When false, returns null. */
  strict?: boolean;
}

const REQUEST_PREFIX = "rufw_";

declare global {
  interface Window {
    reflexInvoke?: ReflexInvokeFn;
  }
}

function postMessageInvoke<T>(
  method: string,
  params: ReflexBridgePayload,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("reflex bridge: window is unavailable"));
      return;
    }
    const id = REQUEST_PREFIX + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
    const onMessage = (event: MessageEvent) => {
      const data = event.data as
        | { source?: string; id?: string; result?: T; error?: unknown }
        | undefined;
      if (!data || data.source !== "reflex" || data.id !== id) return;
      window.removeEventListener("message", onMessage);
      if (data.error) {
        reject(data.error);
      } else {
        resolve(data.result as T);
      }
    };
    window.addEventListener("message", onMessage);
    try {
      window.parent.postMessage(
        { source: "reflex-app", type: "request", id, method, params: params ?? {} },
        "*",
      );
    } catch (error) {
      window.removeEventListener("message", onMessage);
      reject(error);
    }
  });
}

let configuredOptions: ReflexBridgeOptions = {};

export function configureReflexBridge(options: ReflexBridgeOptions): void {
  configuredOptions = { ...configuredOptions, ...options };
}

export function resetReflexBridge(): void {
  configuredOptions = {};
}

export function hasReflexHost(): boolean {
  if (configuredOptions.invoke || configuredOptions.mock?.invoke) return true;
  if (typeof window === "undefined") return false;
  return typeof window.reflexInvoke === "function";
}

/**
 * Invoke a Reflex bridge method by id. Resolution order:
 *
 *   1. {@link configureReflexBridge} `invoke` override.
 *   2. `window.reflexInvoke` injected by the host.
 *   3. Direct `postMessage` fallback (the same contract the host uses).
 *   4. Mock invoke / handler from {@link configureReflexBridge} `mock`.
 */
export async function reflexInvoke<T = unknown>(
  method: string,
  params?: ReflexBridgePayload,
): Promise<T> {
  const override = configuredOptions.invoke;
  if (override) return override<T>(method, params);

  if (typeof window !== "undefined" && typeof window.reflexInvoke === "function") {
    return window.reflexInvoke<T>(method, params);
  }

  if (typeof window !== "undefined" && window.parent && window.parent !== window) {
    return postMessageInvoke<T>(method, params);
  }

  const mock = configuredOptions.mock;
  if (mock) {
    if (mock.invoke) return mock.invoke<T>(method, params);
    const handler = mock.handlers?.[method];
    if (handler) return Promise.resolve(handler(params ?? {})) as Promise<T>;
  }

  if (configuredOptions.strict === false) {
    return null as unknown as T;
  }

  throw new Error(
    `reflex bridge: no transport available for "${method}". ` +
      "Open this utility from Reflex OS or call configureReflexBridge({ mock }) for local development.",
  );
}

/** Bind a single bridge method to a typed call site. */
export function defineBridgeMethod<TParams = void, TResult = unknown>(method: string) {
  return (params?: TParams): Promise<TResult> =>
    reflexInvoke<TResult>(method, params as ReflexBridgePayload);
}
