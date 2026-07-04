import type { Theme } from './schema/theme-schemas';

/**
 * Theme pane state used for palette/undo snapshot (e.g. color picker open).
 */
export interface ThemePaneState {
  theme: Theme | null;
  checkedColorRefs: string[];
  checkedContrastRefs: string[];
  hueAdjustment: number;
  saturationAdjustment: number;
  valueAdjustment: number;
  hueReferenceHex: string;
}

/**
 * How selected theme colors should be summarized in the UI.
 */
export type SelectedColorsDisplay =
  | { kind: 'none' }
  | { kind: 'single'; hex: string }
  | { kind: 'mixed' };
