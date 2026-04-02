import type { Template, Theme, ThemeReference } from '../../../model/schemas';
import type { TokenizedPreview } from '../../../model/preview-types';

export interface ThemeEntry {
  isLoaded: boolean;
  theme: Theme | undefined;
}

/** Map: theme name -> version -> entry */
export type ThemeStoreMap = Record<string, Record<string, ThemeEntry>>;

export interface GenerateResult {
  success: boolean;
  message: string;
}

export interface ThemesState {
  selectedRef: ThemeReference | null;
  theme: Theme | null;
  /** Checked color variable refs for palette/undo (theme pane selection). */
  checkedColorRefs: string[];
  /** Checked contrast variable refs for theme pane selection. */
  checkedContrastRefs: string[];
  /** Hue adjustment slider value for undo/redo; 0 = centered. */
  hueAdjustment: number;
  /** Reference hex for hue slider 0 point; default #FF0000. */
  hueReferenceHex: string;
  isCreating: boolean;
  createDialogOpen: boolean;
  createFormName: string;
  generateResult: GenerateResult | null;
  saveError: string | null;
  /** Draft text for assign-color input (session only; not persisted). */
  assignColorDraftText: string;
  /** Search filter text for theme variables list. */
  themeVariablesSearchText: string;
  /** Preview variable list filter text (THEME_PREVIEW_VARIABLE_FILTER_*). */
  previewVariableFilterText: string;
  /** Selected preview sample key for scrolling preview windows (THEME_PREVIEW_SAMPLE_*). */
  selectedPreviewSampleKey: string;
  /** Tokenized editor previews (loaded on theme page load). */
  editorPreviews: TokenizedPreview[];
  /** Template loaded for the current theme (for theme pane display). */
  loadedTemplateForTheme: Template | null;
  /** Context key for currently open color picker overlay (e.g. 'dark:someRef', 'light:someRef', 'assign', 'hue'). null when no picker is open via action. */
  openPickerContext: string | null;
  /** Draft text values for in-progress variable edits (key: 'colorDark:{ref}', 'colorLight:{ref}', 'contrastDark:value:{ref}', etc.). */
  variableDraftTexts: Record<string, string>;
  /** List index: name -> version -> loaded entry */
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

/** Derive theme refs from the theme map (sorted by name, then version). */
export function getThemeRefsFromThemeMap(map: ThemeStoreMap): ThemeReference[] {
  const refs: ThemeReference[] = [];
  for (const name of Object.keys(map).sort()) {
    for (const version of Object.keys(map[name]!).sort()) {
      refs.push({ name, version });
    }
  }
  return refs;
}

export function getThemeRefsFromThemesState(state: ThemesState): ThemeReference[] {
  return getThemeRefsFromThemeMap(state.themeMap);
}
