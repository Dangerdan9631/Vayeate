import type {
  GeneratedTheme,
  GeneratedThemePair,
  ThemeKind,
  ThemeTemplate,
  TokenColorRule,
} from "../domain/types";
import { adjustBrightness, normalizeHex } from "./color";
import { getPolicyForThemeKind, semanticTarget, tokenTarget } from "./contrast-policy";

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

function applyTokenBinding(
  theme: GeneratedTheme,
  kind: ThemeKind,
  key: string,
  value: string,
  background: string,
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

  const foreground = adjustBrightness(value, background, target, "min");
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

  theme.semanticTokenColors[key] = adjustBrightness(value, background, target, "min");
}

export function generateTheme(template: ThemeTemplate, kind: ThemeKind): GeneratedTheme {
  const suffix = kind === "dark" ? "Dark" : "Light";
  const theme = createThemeSkeleton(`${template.name} ${suffix}`.trim(), kind);

  const backgroundVariable = Object.values(template.variables).find((variable) => variable.role === "background");
  const fallbackBg = kind === "dark" ? "#1e1e1e" : "#fafafa";
  const background = backgroundVariable ? normalizeHex(backgroundVariable.value) : fallbackBg;

  for (const binding of template.bindings) {
    const variableHex = getVariableHex(template, binding.variableId);
    if (!variableHex) continue;

    if (binding.target === "colors") {
      if (binding.strategy === "deriveContrast") {
        const policy = getPolicyForThemeKind(kind);
        applyColorBinding(theme, binding.key, adjustBrightness(variableHex, background, policy.default, "min"));
      } else {
        applyColorBinding(theme, binding.key, variableHex);
      }
      continue;
    }

    if (binding.target === "tokenColors") {
      applyTokenBinding(theme, kind, binding.key, variableHex, background, binding.category);
      continue;
    }

    if (binding.target === "semanticTokenColors") {
      applySemanticBinding(theme, kind, binding.key, variableHex, background, binding.category);
    }
  }

  return theme;
}

export function generateThemePair(template: ThemeTemplate): GeneratedThemePair {
  return {
    dark: generateTheme(template, "dark"),
    light: generateTheme(template, "light"),
  };
}