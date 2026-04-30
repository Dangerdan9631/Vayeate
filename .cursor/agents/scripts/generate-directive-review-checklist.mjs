/**
 * Writes directive-review/checklist.md with one section per in-scope directive
 * and one checkbox per implementation file relevant to that directive.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..", "..", "..");
const themeRoot = path.join(repoRoot, "vayeate-theme-studio");
const outDir = path.join(themeRoot, "directive-review");
const outFile = path.join(outDir, "checklist.md");

const tsExtensions = new Set([".ts", ".tsx"]);

function toRepoPath(file) {
  return path.relative(repoRoot, file).replace(/\\/g, "/");
}

function toThemePath(file) {
  return path.relative(themeRoot, file).replace(/\\/g, "/");
}

function exists(...parts) {
  return fs.existsSync(path.join(...parts));
}

function isTestFile(relPath) {
  const n = relPath.replace(/\\/g, "/").toLowerCase();
  if (n.includes("/__tests__/")) return true;
  return /\.(test|spec)\.(tsx?|jsx?)$/.test(n);
}

function* walk(dir) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "node_modules" || ent.name === "dist" || ent.name === "dist-electron") {
        continue;
      }
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

function listFiles(baseDir, predicate) {
  const files = [];
  for (const file of walk(baseDir)) {
    if (predicate(file)) files.push(file);
  }
  files.sort((a, b) => toRepoPath(a).localeCompare(toRepoPath(b)));
  return files;
}

function sourceFilesUnder(...parts) {
  const base = path.join(themeRoot, ...parts);
  return listFiles(base, (file) => {
    const ext = path.extname(file);
    if (!tsExtensions.has(ext)) return false;
    return !isTestFile(toThemePath(file));
  });
}

function sourceFilesMatching(predicate, ...parts) {
  return sourceFilesUnder(...parts).filter((file) => predicate(toThemePath(file), path.basename(file)));
}

function directiveFilesUnder(...parts) {
  const base = path.join(repoRoot, ...parts);
  return listFiles(base, (file) => {
    const name = path.basename(file);
    return name === "SKILL.md" || name.endsWith(".md") || name.endsWith(".mdc");
  });
}

function uniq(files) {
  return [...new Set(files)].sort((a, b) => toRepoPath(a).localeCompare(toRepoPath(b)));
}

const appFiles = sourceFilesUnder("src", "app");
const domainFiles = sourceFilesUnder("src", "domain");
const electronFiles = sourceFilesUnder("electron");
const gatewayFiles = sourceFilesUnder("src", "gateway");
const modelFiles = sourceFilesUnder("src", "model");
const allSourceFiles = uniq([...appFiles, ...domainFiles, ...gatewayFiles, ...modelFiles, ...electronFiles]);

const architectureTest = exists(themeRoot, "test", "architecture", "architecture.test.ts")
  ? [path.join(themeRoot, "test", "architecture", "architecture.test.ts")]
  : [];

const relevantFileResolvers = {
  "app-architecture": () => uniq([...allSourceFiles, ...architectureTest]),
  component: () => sourceFilesMatching((rel, name) => rel.startsWith("src/app/") && name.endsWith(".tsx")),
  controller: () => sourceFilesMatching((_, name) => name.endsWith("-controller.ts"), "src", "app"),
  gateway: () => sourceFilesMatching((_, name) => name.endsWith("-gateway.ts"), "src", "gateway"),
  "layer-app": () => appFiles,
  "layer-domain": () => uniq([...domainFiles, ...sourceFilesMatching((_, name) => name.endsWith("-controller.ts"), "src", "app")]),
  "layer-electron": () => uniq([...electronFiles, ...sourceFilesMatching((rel) => rel.startsWith("src/gateway/services/"), "src", "gateway")]),
  "layer-gateway": () => gatewayFiles,
  model: () => modelFiles,
  operation: () => sourceFilesMatching((_, name) => name.endsWith("-operation.ts"), "src", "domain"),
  service: () => sourceFilesMatching((rel, name) => rel.includes("/services/") && name.endsWith(".ts"), "src", "gateway"),
  state: () => sourceFilesMatching((rel, name) => rel.includes("/state/") && name.endsWith(".ts"), "src", "domain"),
  validation: () => sourceFilesMatching((rel, name) => rel.includes("/validations/") && name.endsWith(".ts"), "src", "domain"),
  viewmodel: () => sourceFilesMatching((_, name) => name.startsWith("use-") && name.endsWith("-viewmodel.ts"), "src", "app"),
  "create-component": () => uniq([
    ...sourceFilesMatching((rel, name) => rel.startsWith("src/app/") && name.endsWith(".tsx")),
    ...sourceFilesMatching((_, name) => name.startsWith("use-") && name.endsWith("-viewmodel.ts"), "src", "app"),
    ...sourceFilesMatching((_, name) => name.endsWith("-action-type.ts") || name.endsWith("-handler.ts"), "src", "app"),
  ]),
  "create-controller": () => sourceFilesMatching((_, name) => name.endsWith("-controller.ts"), "src", "app"),
  "create-gateway": () => uniq([
    ...sourceFilesMatching((_, name) => name.endsWith("-gateway.ts"), "src", "gateway"),
    ...sourceFilesMatching((rel, name) => rel.includes("/services/") && name.endsWith(".ts"), "src", "gateway"),
    ...modelFiles,
  ]),
  "create-model": () => modelFiles,
  "create-operation": () => uniq([
    ...sourceFilesMatching((_, name) => name.endsWith("-operation.ts"), "src", "domain"),
    ...sourceFilesMatching((rel, name) => rel.includes("/state/") && name.endsWith(".ts"), "src", "domain"),
    ...sourceFilesMatching((_, name) => name.endsWith("-gateway.ts"), "src", "gateway"),
    ...sourceFilesMatching((rel, name) => rel.includes("/services/") && name.endsWith(".ts"), "src", "gateway"),
  ]),
  "create-service": () => sourceFilesMatching((rel, name) => rel.includes("/services/") && name.endsWith(".ts"), "src", "gateway"),
  "create-state": () => sourceFilesMatching((rel, name) => rel.includes("/state/") && name.endsWith(".ts"), "src", "domain"),
  "create-validation": () => sourceFilesMatching((rel, name) => rel.includes("/validations/") && name.endsWith(".ts"), "src", "domain"),
  "create-viewmodel": () => uniq([
    ...sourceFilesMatching((_, name) => name.startsWith("use-") && name.endsWith("-viewmodel.ts"), "src", "app"),
    ...sourceFilesMatching((rel, name) => rel.includes("/validations/") && name.endsWith(".ts"), "src", "domain"),
    ...sourceFilesMatching((rel, name) => rel.includes("/state/") && name.endsWith(".ts"), "src", "domain"),
  ]),
  "code-maintainer": () => uniq([
    ...allSourceFiles,
    path.join(repoRoot, ".cursor", "agents", "scripts", "generate-code-review-checklist.mjs"),
  ]),
  "directive-maintainer": () => uniq([
    ...directiveFilesUnder(".cursor", "rules"),
    ...directiveFilesUnder(".agents", "skills"),
    ...directiveFilesUnder(".claude", "skills"),
    ...directiveFilesUnder(".cursor", "agents").filter((file) => path.basename(file) !== "directive-maintainer.md"),
    path.join(repoRoot, ".cursor", "agents", "scripts", "generate-directive-review-checklist.mjs"),
  ]),
};

function directiveKey(file) {
  const rel = toRepoPath(file);
  if (rel.endsWith("/SKILL.md")) {
    const parts = rel.split("/");
    return parts[parts.length - 2];
  }
  return path.basename(file).replace(/\.(mdc|md)$/, "");
}

const directiveFiles = uniq([
  ...directiveFilesUnder(".cursor", "rules"),
  ...directiveFilesUnder(".agents", "skills"),
  ...directiveFilesUnder(".claude", "skills"),
  ...directiveFilesUnder(".cursor", "agents"),
]);
const referencedFiles = new Set();

const lines = [
  "# Directive review checklist",
  "",
  `Generated by \`generate-directive-review-checklist.mjs\` (${directiveFiles.length} directives).`,
  "",
  "Check off each directive after every listed implementation file has been validated against it.",
  "",
];

for (const directive of directiveFiles) {
  const relDirective = toRepoPath(directive);
  const key = directiveKey(directive);
  const relevantFiles = relevantFileResolvers[key]?.() ?? [];
  for (const file of relevantFiles) {
    referencedFiles.add(toRepoPath(file));
  }

  lines.push(`- [ ] \`${relDirective}\``);

  if (relevantFiles.length === 0) {
    lines.push("  - [ ] Identify relevant implementation files for this directive");
  } else {
    for (const file of relevantFiles) {
      lines.push(`  - [ ] \`${toRepoPath(file)}\``);
    }
  }

  lines.push("");
}

const unreferencedFiles = allSourceFiles.filter((file) => !referencedFiles.has(toRepoPath(file)));

lines.push("- [ ] `Unreferenced implementation files`");
lines.push("  Review each file in this section against all directive files for violations.");

if (unreferencedFiles.length === 0) {
  lines.push("  - [ ] No unreferenced implementation files");
} else {
  for (const file of unreferencedFiles) {
    lines.push(`  - [ ] \`${toRepoPath(file)}\``);
  }
}

lines.push("");

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, lines.join("\n"), "utf8");
console.log(`Wrote ${path.relative(themeRoot, outFile)} (${directiveFiles.length} directives, ${unreferencedFiles.length} unreferenced files).`);
