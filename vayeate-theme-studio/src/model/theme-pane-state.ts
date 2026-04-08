import type { Theme } from './schemas';

/** Theme pane state used for palette/undo snapshot (e.g. color picker open). */
export interface ThemePaneState {
  theme: Theme | null;
  checkedColorRefs: string[];
  checkedContrastRefs: string[];
  hueAdjustment: number;
  hueReferenceHex: string;
}

export type SelectedColorsDisplay =
  | { kind: 'none' }
  | { kind: 'single'; hex: string }
  | { kind: 'mixed' };

export function buildThemePaneSnapshot(
  theme: Theme | null,
  checkedColorRefs: string[],
  checkedContrastRefs: string[],
  hueAdjustment: number,
  hueReferenceHex: string,
): ThemePaneState {
  return { theme, checkedColorRefs, checkedContrastRefs, hueAdjustment, hueReferenceHex };
}
