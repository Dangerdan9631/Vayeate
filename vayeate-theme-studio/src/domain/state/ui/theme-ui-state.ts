import type { ColorAssignment, Theme, ThemeReference } from '../../../model/schema/theme-schemas';
import type { SelectedColorsDisplay } from '../../../model/theme-pane-state';
import type { ClusterResult } from '../../utils/color-clustering';

/**
 * Load phase for theme page or selected theme content.
 */
export type LoadState = 'unloaded' | 'loading' | 'loaded';

/**
 * Outcome message from theme generation actions shown in the theme pane.
 */
export interface GenerateResult {
  success: boolean;
  message: string;
}

/**
 * Theme editor pane UI state including selection, drafts, clustering, and derived pane fields.
 */
export interface ThemeUiState {
  pageLoadState: LoadState;
  themeLoadState: LoadState;
  selectedRef: ThemeReference | null;
  theme: Theme | null;
  checkedColorRefs: string[];
  checkedContrastRefs: string[];
  hueAdjustment: number;
  hueReferenceHex: string;
  /**
   * Slider drag preview; null uses theme.paletteClusterCountK.
   */
  previewClusterCountK: number | null;
  generateResult: GenerateResult | null;
  saveError: string | null;
  assignColorDraftText: string;
  themeVariablesSearchText: string;
  openPickerContext: string | null;
  variableDraftTexts: Record<string, string>;
  paneDisplayColorAssignments: ColorAssignment[];
  paneSelectedColorsDisplay: SelectedColorsDisplay;
  orphanColorKeys: string[];
  orphanContrastKeys: string[];
  /**
   * Last computed palette clusters per group key; null before first compute.
   */
  paletteClustersByGroup: Record<string, ClusterResult[]> | null;
  paletteClustersPending: boolean;
  /**
   * When true, cluster swatches from dark assignments; otherwise light.
   */
  paletteClusterByDark: boolean;
}

/**
 * Default theme pane UI state before a theme is selected or loaded.
 */
export const initialThemeUiState: ThemeUiState = {
  pageLoadState: 'unloaded',
  themeLoadState: 'unloaded',
  selectedRef: null,
  theme: null,
  checkedColorRefs: [],
  checkedContrastRefs: [],
  hueAdjustment: 0,
  hueReferenceHex: '#FF0000',
  previewClusterCountK: null,
  generateResult: null,
  saveError: null,
  assignColorDraftText: '',
  themeVariablesSearchText: '',
  openPickerContext: null,
  variableDraftTexts: {},
  paneDisplayColorAssignments: [],
  paneSelectedColorsDisplay: { kind: 'none' },
  orphanColorKeys: [],
  orphanContrastKeys: [],
  paletteClustersByGroup: null,
  paletteClustersPending: false,
  paletteClusterByDark: true,
};
