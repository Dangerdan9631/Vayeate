/**
 * Resolves TextMate token scopes to theme colors using template mappings and color assignments.
 * When a mapping has a contrast variable, token color is adjusted to meet the contrast constraint
 * against the contrast variable's comparison source color. Pure functions for use in the renderer.
 */

import { adjustColorToMeetContrast } from './color-adjust-contrast';
import type { ContrastVariable, Mapping } from '../../model/schema/template-schemas';
import type { ColorAssignment, ContrastAssignment } from '../../model/schema/theme-schemas';

/**
 * Resolved colors and variable refs for one template mapping token key.
 */
export interface ScopeColorMapEntry {
  segments: string[];
  darkColor: string | null;
  lightColor: string | null;
  colorVariableRef: string;
  contrastVariableRef: string | null;
  assignedDark: string | null;
  assignedLight: string | null;
}

/**
 * Scope color map entries sorted by specificity for token resolution.
 */
export interface ScopeColorMap {
  entries: ScopeColorMapEntry[];
}

/**
 * Minimal inputs read by {@link buildScopeColorMap}; kept in one place for equality checks.
 */
export interface ScopeColorMapInputs {
  mappings: readonly {
    tokenKey: string;
    colorVariableRef: string | null;
    contrastVariableRef: string | null;
  }[];
  colorAssignments: readonly {
    colorRef: string;
    dark: string | null;
    light: string | null;
    useDarkForLight: boolean;
  }[];
  contrastAssignments: readonly {
    contrastVariableRef: string;
    dark: {
      value: number;
      comparisonMethod: 'lessThan' | 'equalTo' | 'greaterThan';
      min: number | null;
      max: number | null;
    } | null;
    light: {
      value: number;
      comparisonMethod: 'lessThan' | 'equalTo' | 'greaterThan';
      min: number | null;
      max: number | null;
    } | null;
    useDarkForLight: boolean;
  }[];
  contrastVariables: readonly {
    key: string;
    comparisonSourceRef: string | null;
  }[];
}

/**
 * Projects full template and theme models into minimal scope-map build inputs.
 *
 * @param mappings - Template token mappings.
 * @param colorAssignments - Theme color assignments.
 * @param contrastAssignments - Optional theme contrast assignments.
 * @param contrastVariables - Optional template contrast variable definitions.
 * @returns Normalized inputs for {@link buildScopeColorMap} and equality checks.
 */
export function selectScopeColorMapInputs(
  mappings: readonly Mapping[],
  colorAssignments: readonly ColorAssignment[],
  contrastAssignments?: readonly ContrastAssignment[],
  contrastVariables?: readonly ContrastVariable[],
): ScopeColorMapInputs {
  return {
    mappings: mappings.map((m) => ({
      tokenKey: m.token.key,
      colorVariableRef: m.colorVariableRef,
      contrastVariableRef: m.contrastVariableRef,
    })),
    colorAssignments: colorAssignments.map((a) => ({
      colorRef: a.colorRef,
      dark: a.dark?.value ?? null,
      light: a.light?.value ?? null,
      useDarkForLight: a.useDarkForLight,
    })),
    contrastAssignments: (contrastAssignments ?? []).map((a) => ({
      contrastVariableRef: a.contrastVariableRef,
      dark: a.dark
        ? {
            value: a.dark.value,
            comparisonMethod: a.dark.comparisonMethod,
            min: a.dark.min ?? null,
            max: a.dark.max ?? null,
          }
        : null,
      light: a.light
        ? {
            value: a.light.value,
            comparisonMethod: a.light.comparisonMethod,
            min: a.light.min ?? null,
            max: a.light.max ?? null,
          }
        : null,
      useDarkForLight: a.useDarkForLight,
    })),
    contrastVariables: (contrastVariables ?? []).map((v) => ({
      key: v.key,
      comparisonSourceRef: v.comparisonSourceRef,
    })),
  };
}

/**
 * Compares two scope color map input snapshots for memoization invalidation.
 *
 * @param before - Previous scope map inputs.
 * @param after - Current scope map inputs.
 * @returns True when serialized inputs are identical.
 */
export function areScopeColorMapInputsEqual(
  before: ScopeColorMapInputs,
  after: ScopeColorMapInputs,
): boolean {
  return hashScopeColorMapInputs(before) === hashScopeColorMapInputs(after);
}

/**
 * Stable version string for cache keys; changes only when assignment values read by buildScopeColorMap change.
 *
 * @param inputs - Scope color map inputs to fingerprint.
 * @returns JSON string used as a memoization or cache key.
 */
export function hashScopeColorMapInputs(inputs: ScopeColorMapInputs): string {
  return JSON.stringify(inputs);
}

/**
 * Split a token key or scope string into segments (dot, space, or colon separated).
 */
function toSegments(key: string): string[] {
  return key.split(/[.\s:]+/).filter(Boolean);
}

/**
 * Check if token key segments are a prefix match for scope segments.
 * Token key may contain * as a wildcard for a single segment.
 */
function segmentPrefixMatch(tokenSegments: string[], scopeSegments: string[]): boolean {
  if (tokenSegments.length > scopeSegments.length) return false;
  for (let i = 0; i < tokenSegments.length; i++) {
    const t = tokenSegments[i];
    const s = scopeSegments[i];
    if (t !== '*' && t !== s) return false;
  }
  return true;
}

/**
 * Resolve color for a mode from colorAssignments (respects useDarkForLight for light).
 */
function colorForRef(
  colorAssignments: readonly ColorAssignment[],
  colorRef: string,
  mode: 'dark' | 'light',
): string | null {
  const a = colorAssignments.find((x) => x.colorRef === colorRef);
  if (!a) return null;
  if (mode === 'dark') return a.dark?.value ?? null;
  return a.useDarkForLight ? a.dark?.value ?? null : a.light?.value ?? null;
}

/**
 * Get contrast assignment value for a contrast variable and mode, or null if not assigned.
 */
function contrastValueForRef(
  contrastAssignments: readonly ContrastAssignment[],
  contrastVariableRef: string,
  mode: 'dark' | 'light',
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
 * Builds a scope-to-color map from template mappings and theme color assignments.
 * When contrast data is provided, token colors are adjusted to meet contrast constraints.
 *
 * @param mappings - Template token mappings with color and contrast variable refs.
 * @param colorAssignments - Theme color assignments for resolved hex values.
 * @param contrastAssignments - Optional theme contrast assignment values.
 * @param contrastVariables - Optional template contrast variable definitions.
 * @returns Scope color map with entries sorted by specificity (longest token key first).
 */
export function buildScopeColorMap(
  mappings: readonly Mapping[],
  colorAssignments: readonly ColorAssignment[],
  contrastAssignments?: readonly ContrastAssignment[],
  contrastVariables?: readonly ContrastVariable[],
): ScopeColorMap {
  const colorByRef = new Map<string, { dark: string | null; light: string | null }>();
  for (const a of colorAssignments) {
    const dark = a.dark?.value ?? null;
    const light = a.useDarkForLight ? a.dark?.value ?? null : a.light?.value ?? null;
    colorByRef.set(a.colorRef, { dark, light });
  }

  const contrastVarByRef =
    (contrastVariables?.length ?? 0) > 0
      ? new Map(contrastVariables!.map((v) => [v.key, v]))
      : null;
  const hasContrast = (contrastAssignments?.length ?? 0) > 0 && contrastVarByRef !== null;

  const entries: ScopeColorMapEntry[] = [];
  for (const m of mappings) {
    const colorRef = m.colorVariableRef;
    if (!colorRef) continue;
    const colors = colorByRef.get(colorRef);
    if (!colors) continue;

    const assignedDark = colors.dark;
    const assignedLight = colors.light;
    let darkColor = colors.dark;
    let lightColor = colors.light;

    if (hasContrast && m.contrastVariableRef) {
      const cv = contrastVarByRef!.get(m.contrastVariableRef);
      const sourceRef = cv?.comparisonSourceRef ?? null;
      if (sourceRef) {
        const darkSource = colorForRef(colorAssignments, sourceRef, 'dark');
        const lightSource = colorForRef(colorAssignments, sourceRef, 'light');
        const darkContrast = contrastValueForRef(contrastAssignments!, m.contrastVariableRef, 'dark');
        const lightContrast = contrastValueForRef(contrastAssignments!, m.contrastVariableRef, 'light');

        if (darkColor && darkSource && darkContrast) {
          darkColor = adjustColorToMeetContrast(darkColor, darkSource, {
            comparisonMethod: darkContrast.comparisonMethod,
            value: darkContrast.value,
            min: darkContrast.min,
            max: darkContrast.max,
          });
        }
        if (lightColor && lightSource && lightContrast) {
          lightColor = adjustColorToMeetContrast(lightColor, lightSource, {
            comparisonMethod: lightContrast.comparisonMethod,
            value: lightContrast.value,
            min: lightContrast.min,
            max: lightContrast.max,
          });
        }
      }
    }

    const segments = toSegments(m.token.key);
    entries.push({
      segments,
      darkColor,
      lightColor,
      colorVariableRef: colorRef,
      contrastVariableRef: m.contrastVariableRef,
      assignedDark,
      assignedLight,
    });
  }

  entries.sort((a, b) => b.segments.length - a.segments.length);
  return { entries };
}

/**
 * Resolves the best-matching scope map entry for a token's scope stack.
 *
 * @param scopes - TextMate scope stack from most to least specific.
 * @param scopeColorMap - Prebuilt scope color map.
 * @returns Matching entry when one has a color, otherwise null.
 */
export function resolveTokenEntry(
  scopes: string[],
  scopeColorMap: ScopeColorMap,
): ScopeColorMapEntry | null {
  const scopeList = scopes.length > 0 ? scopes : [''];
  for (let s = scopeList.length - 1; s >= 0; s--) {
    const scopeSegments = toSegments(scopeList[s]);
    for (const entry of scopeColorMap.entries) {
      if (segmentPrefixMatch(entry.segments, scopeSegments)) {
        if (entry.darkColor || entry.lightColor) return entry;
        break;
      }
    }
  }
  return null;
}

/**
 * Resolves the best-matching hex color for a token's scope stack in the given mode.
 *
 * @param scopes - TextMate scope stack from most to least specific.
 * @param scopeColorMap - Prebuilt scope color map.
 * @param mode - `dark` or `light` color variant to return.
 * @returns Resolved hex color or null when no mapping matches.
 */
export function resolveTokenColor(
  scopes: string[],
  scopeColorMap: ScopeColorMap,
  mode: 'dark' | 'light',
): string | null {
  const scopeList = scopes.length > 0 ? scopes : [''];
  for (let s = scopeList.length - 1; s >= 0; s--) {
    const scopeSegments = toSegments(scopeList[s]);
    for (const entry of scopeColorMap.entries) {
      if (segmentPrefixMatch(entry.segments, scopeSegments)) {
        const color = mode === 'dark' ? entry.darkColor : entry.lightColor;
        if (color) return color;
        break;
      }
    }
  }
  return null;
}

/**
 * Resolves the color for a VS Code theme token key with contrast adjustment when configured.
 *
 * @param tokenKey - Theme token key from template mappings, or null.
 * @param mappings - Template mappings including theme-type tokens.
 * @param colorAssignments - Theme color assignments.
 * @param contrastAssignments - Theme contrast assignments.
 * @param contrastVariables - Template contrast variable definitions.
 * @param mode - `dark` or `light` variant to resolve.
 * @param fallback - Hex returned when the token key is missing or unmapped.
 * @returns Resolved hex color or fallback.
 */
export function resolveColorForThemeTokenKey(
  tokenKey: string | null,
  mappings: readonly Mapping[],
  colorAssignments: readonly ColorAssignment[],
  contrastAssignments: readonly ContrastAssignment[],
  contrastVariables: readonly ContrastVariable[],
  mode: 'dark' | 'light',
  fallback: string,
): string {
  if (!tokenKey) return fallback;
  const m = mappings.find(
    (x) => x.token.key === tokenKey && x.token.type === 'theme' && x.colorVariableRef != null,
  );
  if (!m) return fallback;

  const colorRef = m.colorVariableRef!;
  let color = colorForRef(colorAssignments, colorRef, mode);
  if (!color) return fallback;

  const contrastRef = m.contrastVariableRef;
  if (contrastRef && contrastVariables.length > 0 && contrastAssignments.length > 0) {
    const cv = contrastVariables.find((v) => v.key === contrastRef);
    const sourceRef = cv?.comparisonSourceRef ?? null;
    if (sourceRef) {
      const sourceColor = colorForRef(colorAssignments, sourceRef, mode);
      const contrastVal = contrastValueForRef(contrastAssignments, contrastRef, mode);
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
