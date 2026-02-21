import type { CatalogSnapshot, ElementBinding, ThemeTemplate } from "../../domain/types";

const COPY_FROM_DARK_COLOR_PREFIXES = [
  "titleBar.",
  "menu.",
  "menubar.",
  "activityBar",
  "statusBar",
  "notifications",
  "notification",
  "extensionButton",
  "badge",
  "breadcrumb",
  "tab.",
  "panel.",
  "terminal.",
];

function containsAny(value: string, needles: string[]): boolean {
  return needles.some((needle) => value.includes(needle));
}

function inferCategory(key: string): ElementBinding["category"] {
  const normalized = key.toLowerCase();
  if (containsAny(normalized, ["comment"])) return "comment";
  if (containsAny(normalized, ["string", "regexp"])) return "string";
  if (containsAny(normalized, ["keyword", "control", "storage", "modifier"])) return "keyword";
  return "default";
}

function inferVariableId(key: string, template: ThemeTemplate): string {
  const ids = Object.keys(template.variables);
  const fallback = ids[0] ?? "";
  const normalized = key.toLowerCase();

  const preferredOrder = [
    containsAny(normalized, ["background"]) ? "background" : "",
    containsAny(normalized, ["foreground", "text", "border"]) ? "foreground" : "",
    containsAny(normalized, ["comment"]) ? "comment" : "",
    containsAny(normalized, ["string", "regexp"]) ? "string" : "",
    containsAny(normalized, ["keyword", "control", "storage", "modifier"]) ? "keyword" : "",
    "accent",
  ].filter(Boolean);

  for (const preferred of preferredOrder) {
    if (ids.includes(preferred)) return preferred;
  }

  return fallback;
}

function inferColorStrategy(key: string): ElementBinding["strategy"] {
  const normalized = key.toLowerCase();
  if (normalized.includes("background")) return "raw";
  if (COPY_FROM_DARK_COLOR_PREFIXES.some((prefix) => key.startsWith(prefix))) return "copyFromDark";
  return "deriveContrast";
}

export function buildCoverageBinding(
  target: ElementBinding["target"],
  key: string,
  template: ThemeTemplate,
): ElementBinding {
  const category = inferCategory(key);
  const variableId = inferVariableId(key, template);

  if (target === "colors") {
    return {
      target,
      key,
      variableId,
      strategy: inferColorStrategy(key),
      category,
    };
  }

  return {
    target,
    key,
    variableId,
    strategy: "deriveContrast",
    category,
  };
}

export function createMissingCoverageBindings(
  template: ThemeTemplate,
  snapshot: CatalogSnapshot,
): { bindings: ElementBinding[]; counts: { colors: number; semantic: number; token: number } } {
  const existing = new Set(template.bindings.map((binding) => `${binding.target}::${binding.key}`));
  const missing: ElementBinding[] = [];

  const addForTarget = (target: ElementBinding["target"], keys: string[]): number => {
    let added = 0;
    for (const key of [...keys].sort()) {
      const marker = `${target}::${key}`;
      if (existing.has(marker)) continue;
      missing.push(buildCoverageBinding(target, key, template));
      existing.add(marker);
      added += 1;
    }
    return added;
  };

  const colors = addForTarget("colors", snapshot.colorKeys);
  const semantic = addForTarget("semanticTokenColors", snapshot.semanticTokenKeys);
  const token = addForTarget("tokenColors", snapshot.textMateScopes);

  return {
    bindings: missing,
    counts: { colors, semantic, token },
  };
}