/**
 * Generates VS Code theme JSON (dark and light) from Theme + Template.
 * Reuses the same color resolution and contrast logic as the preview (scope-resolver).
 */

import { adjustColorToMeetContrast } from './color-adjust-contrast';
import type { Mapping, Template } from '../../model/schema/template-schemas';
import type { ColorAssignment, ContrastAssignment, Theme } from '../../model/schema/theme-schemas';

export interface TokenColorRule {
  name: string;
  scope: string[];
  settings: { foreground: string };
}

export interface SemanticTokenValue {
  foreground?: string;
  fontStyle?: string;
  strikethrough?: boolean;
}

export interface GeneratedTheme {
  name: string;
  type: 'dark' | 'light';
  semanticHighlighting: boolean;
  colors: Record<string, string>;
  tokenColors: TokenColorRule[];
  semanticTokenColors: Record<string, string | SemanticTokenValue>;
}

type Mode = 'dark' | 'light';

function colorForRef(
  colorAssignments: readonly ColorAssignment[],
  colorRef: string,
  mode: Mode,
): string | null {
  const a = colorAssignments.find((x) => x.colorRef === colorRef);
  if (!a) return null;
  if (mode === 'dark') return a.dark?.value ?? null;
  return a.useDarkForLight ? a.dark?.value ?? null : a.light?.value ?? null;
}

function contrastValueForRef(
  contrastAssignments: readonly ContrastAssignment[],
  contrastVariableRef: string,
  mode: Mode,
): { value: number; comparisonMethod: 'lessThan' | 'equalTo' | 'greaterThan'; min: number | null; max: number | null } | null {
  const a = contrastAssignments.find((x) => x.contrastVariableRef === contrastVariableRef);
  if (!a) return null;
  const val = mode === 'dark' ? a.dark : a.useDarkForLight ? a.dark : a.light;
  if (!val) return null;
  return {
    value: val.value,
    comparisonMethod: val.comparisonMethod,
    min: val.min ?? null,
    max: val.max ?? null,
  };
}

/**
 * Resolve the hex color for a single mapping in a given mode.
 * Applies contrast adjustment when the mapping has a contrast variable.
 */
export function resolveColor(
  theme: Theme,
  template: Template,
  mapping: Mapping,
  mode: Mode,
): string | null {
  const colorRef = mapping.colorVariableRef;
  if (!colorRef) return null;

  let color = colorForRef(theme.colorAssignments, colorRef, mode);
  if (!color) return null;

  const contrastRef = mapping.contrastVariableRef ?? null;
  if (
    contrastRef &&
    template.contrastVariables.length > 0 &&
    theme.contrastAssignments.length > 0
  ) {
    const cv = template.contrastVariables.find((v) => v.key === contrastRef);
    const sourceRef = cv?.comparisonSourceRef ?? null;
    if (sourceRef) {
      const sourceColor = colorForRef(theme.colorAssignments, sourceRef, mode);
      const contrastVal = contrastValueForRef(theme.contrastAssignments, contrastRef, mode);
      if (sourceColor && contrastVal) {
        color = adjustColorToMeetContrast(color, sourceColor, {
          comparisonMethod: contrastVal.comparisonMethod,
          value: contrastVal.value,
          min: contrastVal.min,
          max: contrastVal.max,
        });
      }
    }
  }

  return color;
}

/**
 * Build display name for the theme (e.g. "Vayeate" for dark, "Vayeate Light" for light).
 */
function themeDisplayName(themeName: string, mode: Mode): string {
  const base = themeName.charAt(0).toUpperCase() + themeName.slice(1);
  return mode === 'light' ? `${base} Light` : base;
}

/**
 * Generate a single theme (dark or light) from theme + template.
 */
export function generateTheme(theme: Theme, template: Template, mode: Mode): GeneratedTheme {
  const colors: Record<string, string> = {};
  const tokenGroupsByColorRef = new Map<string, { scopes: string[]; color: string | null }>();
  const semanticTokenColors: Record<string, string | SemanticTokenValue> = {};

  for (const m of template.mappings) {
    const resolved = resolveColor(theme, template, m, mode);
    const key = m.token.key;
    const tokenType = m.token.type;

    if (tokenType === 'theme') {
      if (resolved) colors[key] = resolved;
      continue;
    }

    if (tokenType === 'textmate token') {
      const colorRef = m.colorVariableRef;
      if (!colorRef) continue;
      const existing = tokenGroupsByColorRef.get(colorRef);
      if (existing) {
        existing.scopes.push(key);
        if (resolved && existing.color === null) existing.color = resolved;
      } else {
        tokenGroupsByColorRef.set(colorRef, { scopes: [key], color: resolved ?? null });
      }
      continue;
    }

    if (tokenType === 'semantic token') {
      if (key === '*.deprecated') {
        semanticTokenColors[key] = { strikethrough: true };
        continue;
      }
      if (resolved) semanticTokenColors[key] = resolved;
    }
  }

  const tokenColors: TokenColorRule[] = [];
  for (const [colorRef, { scopes, color }] of tokenGroupsByColorRef) {
    if (color && scopes.length > 0) {
      tokenColors.push({
        name: colorRef,
        scope: scopes,
        settings: { foreground: color },
      });
    }
  }

  return {
    name: themeDisplayName(theme.name, mode),
    type: mode,
    semanticHighlighting: true,
    colors,
    tokenColors,
    semanticTokenColors,
  };
}

/**
 * Generate both dark and light theme objects.
 */
export function generateThemePair(
  theme: Theme,
  template: Template,
): { dark: GeneratedTheme; light: GeneratedTheme } {
  return {
    dark: generateTheme(theme, template, 'dark'),
    light: generateTheme(theme, template, 'light'),
  };
}
