import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "bridge/index": "src/bridge/index.ts",
    "react/index": "src/react/index.ts",
    "components/index": "src/components/index.ts",
    "tailwind/preset": "src/tailwind/preset.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: false,
  clean: true,
  splitting: false,
  treeshake: true,
  cjsInterop: true,
  target: "es2020",
  external: ["react", "react-dom", "tailwindcss"],
});
