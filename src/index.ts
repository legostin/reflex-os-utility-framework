/**
 * `reflex-os-utility-framework` — top-level barrel.
 *
 * For tree-shaking, prefer the per-area subpaths:
 *
 *   import { memory } from "reflex-os-utility-framework/bridge";
 *   import { ReflexProvider, useMemoryNotes } from "reflex-os-utility-framework/react";
 *   import { AppShell, MemoryComposer } from "reflex-os-utility-framework/components";
 */
export * from "./bridge";
export * from "./react";
export * from "./components";
export { default as reflexTailwindPreset } from "./tailwind/preset";
