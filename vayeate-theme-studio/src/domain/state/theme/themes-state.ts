import type { Template, Theme, ThemeReference } from '../../../model/schemas';
import type { TokenizedPreview } from '../../../model/preview-types';

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
