import * as React from "react";
import { configureReflexBridge, hasReflexHost } from "../bridge/invoke";
import type {
  ReflexBridgeMock,
  ReflexBridgeOptions,
  ReflexInvokeFn,
} from "../bridge/invoke";
import { bridge } from "../bridge";
import type { ReflexBridge } from "../bridge";

export interface ReflexLocale {
  /** Two-letter language tag, e.g. "en", "ru". Defaults to navigator.language. */
  language: string;
}

export interface ReflexProviderValue {
  bridge: ReflexBridge;
  hasHost: boolean;
  locale: ReflexLocale;
}

const ReflexContext = React.createContext<ReflexProviderValue | null>(null);

export interface ReflexProviderProps {
  children: React.ReactNode;
  /** Override the global bridge invoke. Useful in tests. */
  invoke?: ReflexInvokeFn;
  /** Mock data for environments without the Reflex host. */
  mock?: ReflexBridgeMock;
  /** Disable the "no transport" exception (returns null instead). */
  strict?: boolean;
  /** Force a UI language. Defaults to navigator.language detection. */
  language?: string;
}

function detectLanguage(forced?: string): string {
  if (forced) return forced;
  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language.split("-")[0]!.toLowerCase();
  }
  return "en";
}

export function ReflexProvider(props: ReflexProviderProps) {
  const { children, invoke, mock, strict, language } = props;

  const configured = React.useRef(false);
  if (!configured.current) {
    const options: ReflexBridgeOptions = {};
    if (invoke) options.invoke = invoke;
    if (mock) options.mock = mock;
    if (strict !== undefined) options.strict = strict;
    if (Object.keys(options).length > 0) configureReflexBridge(options);
    configured.current = true;
  }

  React.useEffect(() => {
    const options: ReflexBridgeOptions = {};
    if (invoke) options.invoke = invoke;
    if (mock) options.mock = mock;
    if (strict !== undefined) options.strict = strict;
    if (Object.keys(options).length > 0) configureReflexBridge(options);
  }, [invoke, mock, strict]);

  const value = React.useMemo<ReflexProviderValue>(
    () => ({
      bridge,
      hasHost: hasReflexHost(),
      locale: { language: detectLanguage(language) },
    }),
    [language, invoke, mock],
  );

  return <ReflexContext.Provider value={value}>{children}</ReflexContext.Provider>;
}

export function useReflex(): ReflexProviderValue {
  const ctx = React.useContext(ReflexContext);
  if (!ctx) {
    throw new Error("useReflex must be used inside <ReflexProvider>");
  }
  return ctx;
}

export function useBridge(): ReflexBridge {
  return useReflex().bridge;
}
