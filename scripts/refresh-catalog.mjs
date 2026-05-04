#!/usr/bin/env node
/**
 * refresh-catalog.mjs
 *
 * Reads `BRIDGE_API_GROUPS` from the sibling reflex-os checkout
 * (`../reflex-os/src/appBridgeCatalog.ts`) and writes a deduplicated
 * `scripts/bridge-catalog.json` snapshot used by `check-bridge-coverage.mjs`.
 *
 * The framework intentionally vendors the snapshot rather than depending on
 * reflex-os at build time so npm consumers don't need the host repo present.
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const defaultCatalog = resolve(
  here,
  "..",
  "..",
  "reflex-os",
  "src",
  "appBridgeCatalog.ts",
);
const sourcePath = process.env.REFLEX_OS_CATALOG ?? defaultCatalog;
const outputPath = join(here, "bridge-catalog.json");

const source = await readFile(sourcePath, "utf8").catch((error) => {
  console.error(
    `[refresh-catalog] cannot read ${sourcePath}: ${error.message}\n` +
      `Set REFLEX_OS_CATALOG to the absolute path of appBridgeCatalog.ts.`,
  );
  process.exit(2);
});

const groupsMatch = source.match(/BRIDGE_API_GROUPS\s*=\s*\[([\s\S]*?)\]\s*as const;/);
if (!groupsMatch) {
  console.error("[refresh-catalog] could not locate BRIDGE_API_GROUPS in source.");
  process.exit(3);
}

const methods = new Set();
for (const literal of groupsMatch[1].matchAll(/"([a-z][a-zA-Z0-9._]+)"/g)) {
  methods.add(literal[1]);
}

const sorted = [...methods].sort();
await writeFile(
  outputPath,
  JSON.stringify(
    {
      sourcedFrom: sourcePath,
      generatedAt: new Date().toISOString(),
      methods: sorted,
    },
    null,
    2,
  ) + "\n",
);

console.log(
  `[refresh-catalog] wrote ${sorted.length} method ids to ${outputPath}`,
);
