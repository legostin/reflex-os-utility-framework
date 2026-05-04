#!/usr/bin/env node
/**
 * check-bridge-coverage.mjs
 *
 * Parses the canonical bridge catalog (vendored from reflex-os into
 * `scripts/bridge-catalog.json`, regenerated via `pnpm refresh:catalog`) and
 * asserts that every method id has a string-literal occurrence in any file
 * under `src/bridge/`.
 *
 * Exits non-zero with a list of missing methods so `pnpm build` fails loudly
 * if the host bridge grows past the framework's coverage.
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const catalogPath = join(here, "bridge-catalog.json");
const bridgeRoot = join(repoRoot, "src", "bridge");

async function readCatalog() {
  try {
    const raw = await readFile(catalogPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.methods)) {
      throw new Error("catalog file missing `methods` array");
    }
    return parsed.methods.map(String);
  } catch (error) {
    console.error(
      `[check-bridge-coverage] failed to read ${relative(repoRoot, catalogPath)}: ${error.message}`,
    );
    console.error(
      "Run `pnpm refresh:catalog` (with the reflex-os repo at ../reflex-os) to regenerate it.",
    );
    process.exit(2);
  }
}

async function* walk(dir) {
  const entries = await readdir(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    const info = await stat(full);
    if (info.isDirectory()) {
      yield* walk(full);
    } else if (info.isFile() && full.endsWith(".ts")) {
      yield full;
    }
  }
}

async function readBridgeSources() {
  let combined = "";
  for await (const file of walk(bridgeRoot)) {
    combined += "\n" + (await readFile(file, "utf8"));
  }
  return combined;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

(async () => {
  const methods = await readCatalog();
  const sources = await readBridgeSources();
  const missing = [];
  for (const method of methods) {
    const literal = new RegExp(`["']${escapeRegex(method)}["']`);
    if (!literal.test(sources)) missing.push(method);
  }
  if (missing.length === 0) {
    console.log(
      `[check-bridge-coverage] ok — ${methods.length} bridge methods covered.`,
    );
    return;
  }
  console.error(
    `[check-bridge-coverage] missing ${missing.length} of ${methods.length} bridge methods:`,
  );
  for (const method of missing) console.error(`  - ${method}`);
  process.exit(1);
})();
