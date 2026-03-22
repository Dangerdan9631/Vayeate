import type {
  AppConfig,
  Catalog,
  CatalogReference,
  CatalogType,
  ColorVariableKey,
  ContrastVariableKey,
  SourceType,
  Template,
  TemplateReference,
  Theme,
  ThemeReference,
  TokenType,
} from '../../model/schemas';
import type { TokenizedPreview } from '../../model/preview-types';

export type { TabId } from './tab-id';

export interface CatalogsState {
  selectedRef: CatalogReference | null;
  catalog: Catalog | null;
  /** Catalogs loaded for display (e.g. template page); key = `${name}@${version}` */
  loadedForDisplay: Record<string, Catalog>;
  isCreating: boolean;
  createDialogOpen: boolean;
  createFormName: string;
  createFormType: CatalogType;
  bulkAddDialogOpen: boolean;
  bulkAddText: string;
  tokensSearchText: string;
  newSourceUrl: string;
  newSourceTokenType: TokenType;
  newSourceType: SourceType;
  newTokenKey: string;
}

export interface TemplatesState {
  selectedRef: TemplateReference | null;
  template: Template | null;
  isCreating: boolean;
  createDialogOpen: boolean;
  createFormName: string;
  /** Search filter text for mappings list. */
  mappingSearchText: string;
  /** Selected color variable keys for mapping filter. */
  mappingColorVariableFilter: ColorVariableKey[];
  /** Selected contrast variable keys for mapping filter. */
  mappingContrastVariableFilter: ContrastVariableKey[];
  /** Selected token group for mapping editor display. */
  mappingTokenGroupSelection: string;
  /** Search filter text for template variables list. */
  variablesSearchText: string;
  /** Draft value for the "add group" name input field (TEMPLATE_GROUP_ADD_TEXT_ON_CHANGE). */
  addGroupName: string;
  /** Draft value for the "add variable" name input field (TEMPLATE_VARIABLES_ADD_VARIABLE_NAME_TEXT_ON_CHANGE). */
  addVariableName: string;
}

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
}

/** Current undo stack ID for the history menu; null when no stack is active. */
export interface UndoStackIdState {
  currentUndoStackId: string | null;
  /** Bump to trigger history list refetch after undo/redo/goto. */
  undoListVersion: number;
}

import type { StoreState } from './store-state';
import type { UiState } from './ui-state';
import type { WindowState } from './window-state';

export type { StoreState } from './store-state';
export type { UiState } from './ui-state';
export type { Position, Size, WindowLoadState, WindowState } from './window-state';

export interface AppState {
  catalogs: CatalogsState;
  templates: TemplatesState;
  themes: ThemesState;
  undoStackId: UndoStackIdState;
  /** Persisted app preferences (color scheme, etc.); mirrored to `data/config.json` via operations. */
  appConfig: AppConfig;
  /** Parallel state (not yet used in app/reducer). */
  ui: UiState;
  /** Parallel state (not yet used in app/reducer). */
  store: StoreState;
  /** Parallel state (not yet used in app/reducer). */
  window: WindowState;
}

export const initialAppState: AppState = {
  catalogs: {
    selectedRef: null,
    catalog: null,
    loadedForDisplay: {},
    isCreating: false,
    createDialogOpen: false,
    createFormName: '',
    createFormType: 'manual',
    bulkAddDialogOpen: false,
    bulkAddText: '',
    tokensSearchText: '',
    newSourceUrl: '',
    newSourceTokenType: 'theme',
    newSourceType: 'default',
    newTokenKey: '',
  },
  templates: {
    selectedRef: null,
    template: null,
    isCreating: false,
    createDialogOpen: false,
    createFormName: '',
    mappingSearchText: '',
    mappingColorVariableFilter: [],
    mappingContrastVariableFilter: [],
    mappingTokenGroupSelection: '',
    variablesSearchText: '',
    addGroupName: '',
    addVariableName: '',
  },
  themes: {
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
  },
  undoStackId: {
    currentUndoStackId: null,
    undoListVersion: 0,
  },
  appConfig: { colorScheme: 'dark' },
  ui: {
    activeTabId: 'catalogs',
    queueStatus: { isProcessing: false, queueLength: 0 },
  },
  store: { catalogs: {}, templates: {}, themes: {} },
  window: {
    loadState: 'loading',
    isMinimized: false,
    isMaximized: false,
    size: { width: 0, height: 0 },
    position: { x: 0, y: 0 },
  },
};

export type { AppStateUpdate } from './reducer';
export { appStateReducer } from './reducer';