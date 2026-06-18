#!/usr/bin/env node
/**
 * FAOS v5 — Architecture Validator
 *
 * CI-ONLY build tool. Not bundled. Not imported anywhere.
 *
 * Scans all source files and enforces:
 * 1. Cross-feature import violations (feature A cannot import from feature B)
 * 2. shared/ purity (shared/ cannot import features/ or app/)
 * 3. app/ layer discipline (app/ cannot import React Query directly)
 * 4. feature.manifest.ts dependency graph consistency
 *
 * Usage: node tools/validate-architecture.js
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative, sep } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");

let errors = 0;

function fail(msg) {
  console.error(`\n❌ ARCHITECTURE VIOLATION: ${msg}`);
  errors++;
}

function warn(msg) {
  console.warn(`\n⚠️  WARNING: ${msg}`);
}

/** Recursively collect all .ts / .tsx files */
function collectFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith(".d.ts")) {
      results.push(full);
    }
  }
  return results;
}

/** Extract all @/ import paths from a file */
function extractImports(content) {
  const matches = [];
  const re = /from\s+["'](@\/[^"']+)["']/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    matches.push(m[1]);
  }
  return matches;
}

/** Derive the FAOS layer and feature name from a file path */
function classify(filePath) {
  const rel = relative(SRC, filePath).split(sep);
  const layer = rel[0]; // "features" | "shared" | "app"
  const feature = layer === "features" ? rel[1] : null; // "auth" | "users" | ...
  return { layer, feature };
}

/** Parse an @/ import to its layer + feature */
function classifyImport(importPath) {
  // @/features/users/... → { layer: "features", feature: "users" }
  // @/shared/... → { layer: "shared", feature: null }
  // @/app/... → { layer: "app", feature: null }
  const parts = importPath.replace("@/", "").split("/");
  const layer = parts[0];
  const feature = layer === "features" ? parts[1] : null;
  return { layer, feature };
}

console.log("🔍 FAOS Architecture Validator running...\n");

const files = collectFiles(SRC);

for (const filePath of files) {
  const content = readFileSync(filePath, "utf-8");
  const imports = extractImports(content);
  const { layer: fileLayer, feature: fileFeature } = classify(filePath);

  for (const imp of imports) {
    const { layer: impLayer, feature: impFeature } = classifyImport(imp);

    // Rule 1: Cross-feature imports are forbidden
    if (
      fileLayer === "features" &&
      impLayer === "features" &&
      fileFeature !== impFeature
    ) {
      fail(
        `Cross-feature import in "${relative(ROOT, filePath)}":\n   imports "${imp}" (feature: ${impFeature})\n   Features cannot import from other features.`
      );
    }

    // Rule 2: shared/ must never import from features/ or app/
    if (fileLayer === "shared" && (impLayer === "features" || impLayer === "app")) {
      fail(
        `shared/ purity violation in "${relative(ROOT, filePath)}":\n   imports "${imp}"\n   shared/ must be pure infrastructure — no feature or app imports.`
      );
    }

    // Rule 3: app/ cannot import React Query directly (use useSafeQuery/useSafeMutation)
    if (fileLayer === "app" && imp.includes("@tanstack/react-query")) {
      fail(
        `app/ layer violation in "${relative(ROOT, filePath)}":\n   Direct React Query import detected.\n   Use useSafeQuery or useSafeMutation from @/shared/query instead.`
      );
    }
  }

  // Rule 4: feature.manifest.ts must not be imported into the React tree
  if (filePath.includes("feature.manifest") === false && content.includes("feature.manifest")) {
    fail(
      `Manifest import violation in "${relative(ROOT, filePath)}":\n   feature.manifest files are CI-only and must never be imported into source code.`
    );
  }
}

// --- Manifest dependency graph validation ---
console.log("📦 Validating feature manifest dependency graph...\n");

const manifestPaths = files.filter((f) => f.includes("feature.manifest"));
const manifests = [];

for (const mp of manifestPaths) {
  try {
    // Simple regex parse (avoids dynamic import complexity in Node ESM)
    const content = readFileSync(mp, "utf-8");
    const nameMatch = content.match(/name:\s*["']([^"']+)["']/);
    const depsMatch = content.match(/dependsOn:\s*\[([^\]]*)\]/);

    const name = nameMatch?.[1];
    const deps = depsMatch?.[1]
      .split(",")
      .map((d) => d.replace(/["'\s]/g, ""))
      .filter(Boolean) ?? [];

    if (name) manifests.push({ name, deps });
  } catch {
    warn(`Could not parse manifest at ${relative(ROOT, mp)}`);
  }
}

const knownFeatures = new Set(manifests.map((m) => m.name));

for (const { name, deps } of manifests) {
  for (const dep of deps) {
    if (!knownFeatures.has(dep)) {
      fail(
        `Manifest violation in feature "${name}":\n   declares dependency on "${dep}" but no manifest for "${dep}" exists.`
      );
    }
    // Simple circular dependency check (direct only)
    const depManifest = manifests.find((m) => m.name === dep);
    if (depManifest?.deps.includes(name)) {
      fail(
        `Circular dependency: "${name}" ↔ "${dep}" — features cannot depend on each other circularly.`
      );
    }
  }
}

// --- Final report ---
console.log("─".repeat(50));
if (errors === 0) {
  console.log(`\n✅ Architecture valid. ${files.length} files scanned. Zero violations.\n`);
  process.exit(0);
} else {
  console.error(`\n💥 ${errors} architecture violation(s) found. Build blocked.\n`);
  process.exit(1);
}
