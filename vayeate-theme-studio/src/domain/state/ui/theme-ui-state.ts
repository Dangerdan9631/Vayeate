import type { ColorAssignment, Theme, ThemeReference } from '../../../model/schema/theme-schemas';
import type { SelectedColorsDisplay } from '../../../model/theme-pane-state';

export type LoadState = 'unloaded' | 'loading' | 'loaded';

export interface GenerateResult {
  success: boolean;
  message: string;
}

export interface ThemeUiState {
  pageLoadState: LoadState;
  themeLoadState: LoadState;
  selectedRef: ThemeReference | null;
  theme: Theme | null;
  checkedColorRefs: string[];
  checkedContrastRefs: string[];
  hueAdjustment: number;
  hueReferenceHex: string;
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
}

export const initialThemeUiState: ThemeUiState = {
  pageLoadState: 'unloaded',
  themeLoadState: 'unloaded',
  selectedRef: null,
  theme: null,
  checkedColorRefs: [],
  checkedContrastRefs: [],
  hueAdjustment: 0,
  hueReferenceHex: '#FF0000',
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
};
