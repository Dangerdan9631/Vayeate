/**
 * Generates VS Code theme JSON (dark and light) from Theme + Template.
 * Reuses the same color resolution and contrast logic as the preview (scope-resolver).
 */

import { adjustColorToMeetContrast } from './color-adjust-contrast';
import { DEFERRED_WORK_YIELD_INTERVAL, yieldEvery, yieldToEventLoop } from '../core/scheduler';
import type { Mapping, Template } from '../../model/schema/template-schemas';
import type { ColorAssignment, ContrastAssignment, Theme } from '../../model/schema/theme-schemas';

/**
 * VS Code `tokenColors` entry grouping scopes that share one foreground color.
 */
export interface TokenColorRule {
  name: string;
  scope: string[];
  settings: { foreground: string };
}

/**
 * Semantic token color value or style override in generated theme JSON.
 */
export interface SemanticTokenValue {
  foreground?: string;
  fontStyle?: string;
  strikethrough?: boolean;
}

/**
 * VS Code color theme object produced by {@link generateTheme}.
 */
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
 * Resolves the hex color for one template mapping in the given mode.
 *
 * @param theme - Theme supplying color and contrast assignments.
 * @param template - Template supplying contrast variable definitions.
 * @param mapping - Single mapping whose color and contrast refs are resolved.
 * @param mode - `dark` or `light` variant to resolve.
 * @returns Resolved hex color or null when the mapping has no assigned color.
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
 * Generates one VS Code theme JSON object (dark or light) from theme and template.
 *
 * @param theme - Theme with color and contrast assignments.
 * @param template - Template with mappings and variable definitions.
 * @param mode - `dark` or `light` theme type to build.
 * @returns Complete {@link GeneratedTheme} ready for export serialization.
 */
export function generateTheme(theme: Theme, template: Template, mode: Mode): GeneratedTheme {
  return buildGeneratedTheme(theme, template, mode);
}

/**
 * Generates one VS Code theme JSON object with cooperative yielding between mapping batches.
 *
 * @param theme - Theme with color and contrast assignments.
 * @param template - Template with mappings and variable definitions.
 * @param mode - `dark` or `light` theme type to build.
 * @param yieldGate - Optional yield gate invoked once per mapping iteration.
 * @returns Complete {@link GeneratedTheme} ready for export serialization.
 */
export async function generateThemeAsync(
  theme: Theme,
  template: Template,
  mode: Mode,
  yieldGate: () => Promise<void> = yieldEvery(DEFERRED_WORK_YIELD_INTERVAL),
): Promise<GeneratedTheme> {
  const colors: Record<string, string> = {};
  const tokenGroupsByColorRef = new Map<string, { scopes: string[]; color: string | null }>();
  const semanticTokenColors: Record<string, string | SemanticTokenValue> = {};

  for (const m of template.mappings) {
    await yieldGate();
    applyMappingToGeneratedTheme(theme, template, m, mode, colors, tokenGroupsByColorRef, semanticTokenColors);
  }

  return finalizeGeneratedTheme(theme.name, mode, colors, tokenGroupsByColorRef, semanticTokenColors);
}

function buildGeneratedTheme(theme: Theme, template: Template, mode: Mode): GeneratedTheme {
  const colors: Record<string, string> = {};
  const tokenGroupsByColorRef = new Map<string, { scopes: string[]; color: string | null }>();
  const semanticTokenColors: Record<string, string | SemanticTokenValue> = {};

  for (const m of template.mappings) {
    applyMappingToGeneratedTheme(theme, template, m, mode, colors, tokenGroupsByColorRef, semanticTokenColors);
  }

  return finalizeGeneratedTheme(theme.name, mode, colors, tokenGroupsByColorRef, semanticTokenColors);
}

function applyMappingToGeneratedTheme(
  theme: Theme,
  template: Template,
  mapping: Mapping,
  mode: Mode,
  colors: Record<string, string>,
  tokenGroupsByColorRef: Map<string, { scopes: string[]; color: string | null }>,
  semanticTokenColors: Record<string, string | SemanticTokenValue>,
): void {
  const resolved = resolveColor(theme, template, mapping, mode);
  const key = mapping.token.key;
  const tokenType = mapping.token.type;

  if (tokenType === 'theme') {
    if (resolved) colors[key] = resolved;
    return;
  }

  if (tokenType === 'textmate token') {
    const colorRef = mapping.colorVariableRef;
    if (!colorRef) return;
    const existing = tokenGroupsByColorRef.get(colorRef);
    if (existing) {
      existing.scopes.push(key);
      if (resolved && existing.color === null) existing.color = resolved;
    } else {
      tokenGroupsByColorRef.set(colorRef, { scopes: [key], color: resolved ?? null });
    }
    return;
  }

  if (tokenType === 'semantic token') {
    if (key === '*.deprecated') {
      semanticTokenColors[key] = { strikethrough: true };
      return;
    }
    if (resolved) semanticTokenColors[key] = resolved;
  }
}

function finalizeGeneratedTheme(
  themeName: string,
  mode: Mode,
  colors: Record<string, string>,
  tokenGroupsByColorRef: Map<string, { scopes: string[]; color: string | null }>,
  semanticTokenColors: Record<string, string | SemanticTokenValue>,
): GeneratedTheme {
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
    name: themeDisplayName(themeName, mode),
    type: mode,
    semanticHighlighting: true,
    colors,
    tokenColors,
    semanticTokenColors,
  };
}

/**
 * Generates paired dark and light VS Code theme objects from one theme and template.
 *
 * @param theme - Theme with color and contrast assignments.
 * @param template - Template with mappings and variable definitions.
 * @returns Object with `dark` and `light` {@link GeneratedTheme} instances.
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

/**
 * Generates paired dark and light themes with cooperative yielding between mapping batches.
 *
 * @param theme - Theme with color and contrast assignments.
 * @param template - Template with mappings and variable definitions.
 * @param yieldGate - Optional yield gate invoked once per mapping iteration.
 * @returns Object with `dark` and `light` {@link GeneratedTheme} instances.
 */
export async function generateThemePairAsync(
  theme: Theme,
  template: Template,
  yieldGate: () => Promise<void> = yieldEvery(DEFERRED_WORK_YIELD_INTERVAL),
): Promise<{ dark: GeneratedTheme; light: GeneratedTheme }> {
  const dark = await generateThemeAsync(theme, template, 'dark', yieldGate);
  await yieldToEventLoop();
  const light = await generateThemeAsync(theme, template, 'light', yieldGate);
  return { dark, light };
}
