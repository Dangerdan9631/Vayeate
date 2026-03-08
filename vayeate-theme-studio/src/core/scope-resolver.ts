/**
 * Resolves TextMate token scopes to theme colors using template mappings and color assignments.
 * When a mapping has a contrast variable, token color is adjusted to meet the contrast constraint
 * against the contrast variable's comparison source color. Pure functions for use in the renderer.
 */

import { adjustColorToMeetContrast } from './color';
import type {
  ColorAssignment,
  ContrastAssignment,
  ContrastVariable,
  Mapping,
} from '../model/schemas';

export interface ScopeColorMapEntry {
  segments: string[];
  darkColor: string | null;
  lightColor: string | null;
  colorVariableRef: string;
  contrastVariableRef: string | null;
  assignedDark: string | null;
  assignedLight: string | null;
}

export interface ScopeColorMap {
  entries: ScopeColorMapEntry[];
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
 * Build a scope-to-color map from template mappings and theme color assignments.
 * When contrastAssignments and contrastVariables are provided, token colors are adjusted
 * to meet the contrast variable's constraint against its comparison source color.
 * Entries are sorted by segment count descending so that more specific token keys are tried first.
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
 * Resolve the best-matching entry for a token's scope stack.
 * Same matching logic as resolveTokenColor but returns the full entry, or null if no entry has a color.
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
 * Resolve the best-matching color for a token's scope stack.
 * Scopes are checked from most specific (rightmost) to least specific; the longest matching token key wins.
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
 * Resolve the color for a theme token key using its mapping's color and contrast variable.
 * Returns the resolved dark or light hex, or fallback if tokenKey is null or no theme mapping is found.
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
