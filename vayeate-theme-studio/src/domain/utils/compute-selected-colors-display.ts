import type { ColorAssignment, Theme } from '../../model/schema/theme-schemas';
import type { SelectedColorsDisplay } from '../../model/theme-pane-state';
import { normalizeThemeHex } from './normalize-theme-hex';

export function computeSelectedColorsDisplay(
  theme: Theme | null,
  checkedColorRefs: ReadonlySet<string>,
  displayColorAssignments: readonly ColorAssignment[],
  applyHueToDark: boolean,
  applyHueToLight: boolean,
): SelectedColorsDisplay {
  if (!theme || checkedColorRefs.size === 0) return { kind: 'none' };
  const effectiveHexes: string[] = [];
  for (const a of displayColorAssignments) {
    if (!checkedColorRefs.has(a.colorRef)) continue;
    if (applyHueToDark) {
      const v = a.dark?.value;
      effectiveHexes.push(normalizeThemeHex(v ?? ''));
    }
    if (applyHueToLight) {
      const v = a.useDarkForLight ? a.dark?.value : a.light?.value;
      effectiveHexes.push(normalizeThemeHex(v ?? ''));
    }
  }
  if (effectiveHexes.length === 0) return { kind: 'none' };
  const first = effectiveHexes[0];
  const allSame = effectiveHexes.every((h) => h === first);
  return allSame ? { kind: 'single', hex: first || '#808080' } : { kind: 'mixed' };
}
