import type { Template } from '../../../model/schema/template-schemas';
import type { ColorAssignment, Theme, ThemeReference } from '../../../model/schema/theme-schemas';
import type { TokenizedPreview } from '../../../model/preview-types';
import type { SelectedColorsDisplay } from '../../../model/theme-pane-state';

export interface ThemeEntry {
  isLoaded: boolean;
  theme: Theme | undefined;
}

export type ThemeStoreMap = Record<string, Record<string, ThemeEntry>>;

export interface GenerateResult {
  success: boolean;
  message: string;
}

export interface ThemesState {
  selectedRef: ThemeReference | null;
  theme: Theme | null;
  checkedColorRefs: string[];
  checkedContrastRefs: string[];
  hueAdjustment: number;
  hueReferenceHex: string;
  isCreating: boolean;
  createDialogOpen: boolean;
  createFormName: string;
  generateResult: GenerateResult | null;
  saveError: string | null;
  assignColorDraftText: string;
  themeVariablesSearchText: string;
  previewVariableFilterText: string;
  selectedPreviewSampleKey: string;
  editorPreviews: TokenizedPreview[];
  loadedTemplateForTheme: Template | null;
  openPickerContext: string | null;
  variableDraftTexts: Record<string, string>;
  themeMap: ThemeStoreMap;
  /** Hue-adjusted color assignments for palette and editor preview (derived). */
  paneDisplayColorAssignments: ColorAssignment[];
  paneSelectedColorsDisplay: SelectedColorsDisplay;
  orphanColorKeys: string[];
  orphanContrastKeys: string[];
}

export const initialThemesState: ThemesState = {
  selectedRef: null,
  theme: null,
  checkedColorRefs: [],
  checkedContrastRefs: [],
  hueAdjustment: 0,
  hueReferenceHex: '#FF0000',
  isCreating: false,
  createDialogOpen: false,
  createFormName: '',
  generateResult: null,
  saveError: null,
  assignColorDraftText: '',
  themeVariablesSearchText: '',
  previewVariableFilterText: '',
  selectedPreviewSampleKey: '',
  editorPreviews: [],
  loadedTemplateForTheme: null,
  openPickerContext: null,
  variableDraftTexts: {},
  themeMap: {},
  paneDisplayColorAssignments: [],
  paneSelectedColorsDisplay: { kind: 'none' },
  orphanColorKeys: [],
  orphanContrastKeys: [],
};

export function getThemeRefs(map: ThemeStoreMap): ThemeReference[] {
  const refs: ThemeReference[] = [];
  for (const name of Object.keys(map).sort()) {
    for (const version of Object.keys(map[name]!).sort()) {
      refs.push({ name, version });
    }
  }
  return refs;
}
