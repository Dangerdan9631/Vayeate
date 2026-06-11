import type { ThemePaneState } from '../../model/theme-pane-state';
import type { Theme } from '../../model/schema/theme-schemas';

/**
 * Assembles a theme pane state snapshot from editor pane inputs.
 *
 * @param theme - Loaded theme or null when none is selected.
 * @param checkedColorRefs - Color variable keys currently checked in the palette.
 * @param checkedContrastRefs - Contrast variable keys currently checked.
 * @param hueAdjustment - Palette hue slider value in UI units.
 * @param hueReferenceHex - Reference hex driving hue shift display.
 * @returns {@link ThemePaneState} snapshot for undo recording or comparison.
 */
export function buildThemePaneSnapshot(
  theme: Theme | null,
  checkedColorRefs: string[],
  checkedContrastRefs: string[],
  hueAdjustment: number,
  hueReferenceHex: string,
): ThemePaneState {
  return { theme, checkedColorRefs, checkedContrastRefs, hueAdjustment, hueReferenceHex };
}
