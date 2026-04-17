import type { ThemePaneState } from '../../model/theme-pane-state';
import type { Theme } from '../../model/schema/theme-schemas';

export function buildThemePaneSnapshot(
  theme: Theme | null,
  checkedColorRefs: string[],
  checkedContrastRefs: string[],
  hueAdjustment: number,
  hueReferenceHex: string,
): ThemePaneState {
  return { theme, checkedColorRefs, checkedContrastRefs, hueAdjustment, hueReferenceHex };
}
