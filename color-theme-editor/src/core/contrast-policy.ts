import type { ContrastPolicy, ThemeKind } from "../domain/types";

export const DARK_POLICY_DEFAULTS: ContrastPolicy = {
  comment: 3,
  keyword: 6,
  string: 4,
  default: 4.5,
  toolbarMaxContrast: 2,
  lightBackgroundMaxContrast: 10,
};

export const LIGHT_POLICY_DEFAULTS: ContrastPolicy = {
  comment: 1.5,
  keyword: 5,
  string: 4,
  default: 3,
  toolbarMaxContrast: 2,
  lightBackgroundMaxContrast: 10,
};

const KEYWORD_SEMANTIC = new Set([
  "keyword",
  "controlKeyword",
  "plainKeyword",
  "modifier",
  "storageType",
]);

const STRING_SEMANTIC = new Set(["string", "stringEscapeCharacter", "regexp"]);

function scopeSegments(scope: string): string[] {
  return scope.split(/[\s.]+/).filter(Boolean);
}

function isCommentScope(scope: string): boolean {
  return scope.startsWith("comment") || scope.startsWith("punctuation.definition.comment");
}

function isKeywordScope(scope: string): boolean {
  return scopeSegments(scope).some((segment) => segment === "keyword" || segment === "storage");
}

function isStringScope(scope: string): boolean {
  return (
    scopeSegments(scope).some((segment) => segment === "string") ||
    scope.startsWith("punctuation.definition.string")
  );
}

export function tokenTarget(
  scope: string | string[],
  kind: ThemeKind,
  policy: ContrastPolicy,
): number {
  const scopes = Array.isArray(scope) ? scope : [scope];
  if (scopes.some(isCommentScope)) return policy.comment;
  if (scopes.some(isKeywordScope)) return policy.keyword;
  if (scopes.some(isStringScope)) return policy.string;
  return policy.default;
}

export function semanticTarget(key: string, policy: ContrastPolicy): number {
  const base = key.split(".")[0];
  if (base === "comment") return policy.comment;
  if (KEYWORD_SEMANTIC.has(base)) return policy.keyword;
  if (STRING_SEMANTIC.has(base)) return policy.string;
  return policy.default;
}

export function getPolicyForThemeKind(kind: ThemeKind): ContrastPolicy {
  return kind === "dark" ? DARK_POLICY_DEFAULTS : LIGHT_POLICY_DEFAULTS;
}