import type { ColorVariable } from '../../model/schema/template-schemas';
import type { ColorAssignment } from '../../model/schema/theme-schemas';

/**
 * Map key used for color assignments whose variable has no template group.
 */
export const PALETTE_UNGROUPED_KEY = '__ungrouped__';

/**
 * Hex colors and cluster cap for one palette group passed to color clustering.
 */
export interface PaletteClusterGroupInput {
  groupKey: string;
  hexes: string[];
  maxClusters: number;
}

/**
 * Groups color assignments by their template color variable group reference.
 *
 * @param assignments - Theme color assignments to partition.
 * @param colorVariables - Template color variables supplying group refs.
 * @returns Map from group key (or {@link PALETTE_UNGROUPED_KEY}) to assignments.
 */
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

/**
 * Returns palette group keys sorted alphabetically with ungrouped last when present.
 *
 * @param byGroup - Assignments or other values keyed by palette group.
 * @returns Ordered group keys for stable palette UI iteration.
 */
export function sortedPaletteGroupKeys(byGroup: Map<string, unknown[]>): string[] {
  const named = [...byGroup.keys()].filter((k) => k !== PALETTE_UNGROUPED_KEY).sort();
  const hasUngrouped = byGroup.has(PALETTE_UNGROUPED_KEY);
  return hasUngrouped ? [...named, PALETTE_UNGROUPED_KEY] : named;
}

/**
 * Collects unique hex values from assignments for one light or dark variant.
 *
 * @param assignments - Color assignments in a single palette group.
 * @param variant - `light` or `dark` mode variant to read from each assignment.
 * @returns Deduplicated hex strings in encounter order.
 */
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

/**
 * Builds per-group clustering inputs for the theme palette hue reference UI.
 *
 * @param assignments - Full theme color assignments.
 * @param colorVariables - Template color variables for group resolution.
 * @param variant - Light or dark hexes to collect per group.
 * @param maxClusters - Upper bound on clusters per group.
 * @returns One {@link PaletteClusterGroupInput} per sorted group key.
 */
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
