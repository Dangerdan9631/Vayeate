import type { ColorVariable } from '../../model/schema/template-schemas';
import type { ColorAssignment } from '../../model/schema/theme-schemas';

export const PALETTE_UNGROUPED_KEY = '__ungrouped__';

export interface PaletteClusterGroupInput {
  groupKey: string;
  hexes: string[];
  maxClusters: number;
}

export function buildColorAssignmentsByGroup(
  assignments: readonly ColorAssignment[],
  colorVariables: readonly ColorVariable[],
): Map<string, ColorAssignment[]> {
  const varMap = new Map(colorVariables.map((v) => [v.key, v]));
  const byGroup = new Map<string, ColorAssignment[]>();
  for (const a of assignments) {
    const groupRef = varMap.get(a.colorRef)?.groupRef ?? null;
    const groupKey = groupRef ?? PALETTE_UNGROUPED_KEY;
    let list = byGroup.get(groupKey);
    if (!list) {
      list = [];
      byGroup.set(groupKey, list);
    }
    list.push(a);
  }
  return byGroup;
}

export function sortedPaletteGroupKeys(byGroup: Map<string, unknown[]>): string[] {
  const named = [...byGroup.keys()].filter((k) => k !== PALETTE_UNGROUPED_KEY).sort();
  const hasUngrouped = byGroup.has(PALETTE_UNGROUPED_KEY);
  return hasUngrouped ? [...named, PALETTE_UNGROUPED_KEY] : named;
}

export function collectHexForGroupVariant(
  assignments: readonly ColorAssignment[],
  variant: 'light' | 'dark',
): string[] {
  const hexes: string[] = [];
  const seen = new Set<string>();
  for (const a of assignments) {
    if (variant === 'dark') {
      if (a.dark?.value) {
        const h = a.dark.value.toLowerCase();
        if (!seen.has(h)) {
          seen.add(h);
          hexes.push(a.dark.value);
        }
      }
    } else {
      const lightHex = a.useDarkForLight ? a.dark?.value : a.light?.value;
      if (lightHex) {
        const h = lightHex.toLowerCase();
        if (!seen.has(h)) {
          seen.add(h);
          hexes.push(lightHex);
        }
      }
    }
  }
  return hexes;
}

export function buildPaletteClusterGroupInputs(
  assignments: readonly ColorAssignment[],
  colorVariables: readonly ColorVariable[],
  variant: 'light' | 'dark',
  maxClusters: number,
): PaletteClusterGroupInput[] {
  const byGroup = buildColorAssignmentsByGroup(assignments, colorVariables);
  const groupKeys = sortedPaletteGroupKeys(byGroup);
  return groupKeys.map((groupKey) => ({
    groupKey,
    hexes: collectHexForGroupVariant(byGroup.get(groupKey) ?? [], variant),
    maxClusters,
  }));
}
