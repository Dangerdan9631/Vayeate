import type {
  GeneratedTheme,
  GeneratedThemePair,
  ThemeKind,
  ThemeTemplate,
  TokenColorRule,
} from "../domain/types";
import { adjustBrightness, adjustBrightnessMax, normalizeHex } from "./color";
import { getPolicyForThemeKind, semanticTarget, tokenTarget } from "./contrast-policy";
import { TOOLBAR_BG_KEYS } from "./parity-rules";

function createThemeSkeleton(name: string, type: ThemeKind): GeneratedTheme {
  return {
    name,
    type,
    semanticHighlighting: true,
    colors: {},
    tokenColors: [],
    semanticTokenColors: {},
  };
}

function getVariableHex(template: ThemeTemplate, variableId?: string): string | undefined {
  if (!variableId) return undefined;
  const value = template.variables[variableId]?.value;
  return value ? normalizeHex(value) : undefined;
}

function applyColorBinding(theme: GeneratedTheme, key: string, value: string): void {
  theme.colors[key] = normalizeHex(value);
}

function findTokenFromDark(darkTheme: GeneratedTheme, key: string): string | undefined {
  const byName = darkTheme.tokenColors.find((entry) => (entry.name ?? "") === key)?.settings.foreground;
  if (byName) return byName;

  const byScope = darkTheme.tokenColors.find((entry) => {
    if (Array.isArray(entry.scope)) {
      return entry.scope.includes(key);
    }
    return entry.scope === key;
  })?.settings.foreground;

  return byScope;
}

function findSemanticFromDark(darkTheme: GeneratedTheme, key: string): string | undefined {
  const value = darkTheme.semanticTokenColors[key];
  if (!value) return undefined;
  if (typeof value === "string") return value;
  return value.foreground;
}

function isForegroundLikeColorKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return normalized.includes("foreground") || normalized.includes("text") || normalized.includes("border");
}

function applyTokenBinding(
  theme: GeneratedTheme,
  kind: ThemeKind,
  key: string,
  value: string,
  background: string,
  strategy: "raw" | "deriveContrast" | "copyFromDark",
  category?: "comment" | "keyword" | "string" | "default",
): void {
  const policy = getPolicyForThemeKind(kind);
  const scope = key;
  const target = category
    ? category === "comment"
      ? policy.comment
      : category === "keyword"
        ? policy.keyword
        : category === "string"
          ? policy.string
          : policy.default
    : tokenTarget(scope, kind, policy);

  const foreground =
    strategy === "raw" ? normalizeHex(value) : adjustBrightness(value, background, target, "min");
  const rule: TokenColorRule = {
    name: key,
    scope,
    settings: {
      foreground,
    },
  };
  theme.tokenColors.push(rule);
}

function applySemanticBinding(
  theme: GeneratedTheme,
  kind: ThemeKind,
  key: string,
  value: string,
  background: string,
  strategy: "raw" | "deriveContrast" | "copyFromDark",
  category?: "comment" | "keyword" | "string" | "default",
): void {
  const policy = getPolicyForThemeKind(kind);
  const target = category
    ? category === "comment"
      ? policy.comment
      : category === "keyword"
        ? policy.keyword
        : category === "string"
          ? policy.string
          : policy.default
    : semanticTarget(key, policy);

  theme.semanticTokenColors[key] =
    strategy === "raw" ? normalizeHex(value) : adjustBrightness(value, background, target, "min");
}

export function generateTheme(
  template: ThemeTemplate,
  kind: ThemeKind,
  options?: { darkReference?: GeneratedTheme },
): GeneratedTheme {
  const suffix = kind === "dark" ? "Dark" : "Light";
  const theme = createThemeSkeleton(`${template.name} ${suffix}`.trim(), kind);

  const backgroundVariable = Object.values(template.variables).find((variable) => variable.role === "background");
  const fallbackBg = kind === "dark" ? "#1e1e1e" : "#fafafa";
  const background = backgroundVariable ? normalizeHex(backgroundVariable.value) : fallbackBg;

  for (const binding of template.bindings) {
    const variableHex = getVariableHex(template, binding.variableId);
    if (!variableHex) continue;

    const darkReference = options?.darkReference;

    if (binding.target === "colors") {
      if (binding.strategy === "copyFromDark" && kind === "light" && darkReference?.colors[binding.key]) {
        applyColorBinding(theme, binding.key, darkReference.colors[binding.key]);
      } else if (binding.strategy === "deriveContrast" && isForegroundLikeColorKey(binding.key)) {
        const policy = getPolicyForThemeKind(kind);
        applyColorBinding(theme, binding.key, adjustBrightness(variableHex, background, policy.default, "min"));
      } else {
        applyColorBinding(theme, binding.key, variableHex);
      }
      continue;
    }

    if (binding.target === "tokenColors") {
      if (binding.strategy === "copyFromDark" && kind === "light" && darkReference) {
        const fromDark = findTokenFromDark(darkReference, binding.key);
        if (fromDark) {
          applyTokenBinding(theme, kind, binding.key, fromDark, background, "raw", binding.category);
          continue;
        }
      }
      applyTokenBinding(theme, kind, binding.key, variableHex, background, binding.strategy, binding.category);
      continue;
    }

    if (binding.target === "semanticTokenColors") {
      if (binding.strategy === "copyFromDark" && kind === "light" && darkReference) {
        const fromDark = findSemanticFromDark(darkReference, binding.key);
        if (fromDark) {
          applySemanticBinding(theme, kind, binding.key, fromDark, background, "raw", binding.category);
          continue;
        }
      }
      applySemanticBinding(theme, kind, binding.key, variableHex, background, binding.strategy, binding.category);
    }
  }

  if (kind === "dark") {
    const editorBackground = theme.colors["editor.background"] ?? background;
    const policy = getPolicyForThemeKind("dark");
    for (const key of TOOLBAR_BG_KEYS) {
      const existing = theme.colors[key];
      if (!existing) continue;
      theme.colors[key] = adjustBrightnessMax(existing, editorBackground, policy.toolbarMaxContrast);
    }
  }

  return theme;
}

export function generateThemePair(template: ThemeTemplate): GeneratedThemePair {
  const dark = generateTheme(template, "dark");
  const light = generateTheme(template, "light", { darkReference: dark });
  return {
    dark,
    light,
  };
}