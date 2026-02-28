/**
 * Resolves TextMate token scopes to theme colors using template mappings and color assignments.
 * Pure functions for use in the renderer.
 */

import type { ColorAssignment, Mapping } from '../model/schemas';

export interface ScopeColorMapEntry {
  segments: string[];
  darkColor: string | null;
  lightColor: string | null;
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
 * Build a scope-to-color map from template mappings and theme color assignments.
 * Entries are sorted by segment count descending so that more specific token keys are tried first.
 */
export function buildScopeColorMap(
  mappings: readonly Mapping[],
  colorAssignments: readonly ColorAssignment[],
): ScopeColorMap {
  const colorByRef = new Map<string, { dark: string | null; light: string | null }>();
  for (const a of colorAssignments) {
    const dark = a.dark?.value ?? null;
    const light = a.useDarkForLight ? a.dark?.value ?? null : a.light?.value ?? null;
    colorByRef.set(a.colorRef, { dark, light });
  }

  const entries: ScopeColorMapEntry[] = [];
  for (const m of mappings) {
    const colorRef = m.colorVariableRef;
    if (!colorRef) continue;
    const colors = colorByRef.get(colorRef);
    if (!colors) continue;
    const segments = toSegments(m.token.key);
    entries.push({
      segments,
      darkColor: colors.dark,
      lightColor: colors.light,
    });
  }

  entries.sort((a, b) => b.segments.length - a.segments.length);
  return { entries };
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
