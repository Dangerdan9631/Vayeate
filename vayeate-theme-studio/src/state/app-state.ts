import type { Catalog, CatalogReference, Template, TemplateReference, Theme, ThemeReference } from '../model/schemas';
import type { TabId } from '../ui/tabs';

export interface CatalogsState {
  catalogRefs: CatalogReference[];
  selectedRef: CatalogReference | null;
  catalog: Catalog | null;
  /** Catalogs loaded for display (e.g. template page); key = `${name}@${version}` */
  loadedForDisplay: Record<string, Catalog>;
  isCreating: boolean;
  createDialogOpen: boolean;
}

export interface TemplatesState {
  templateRefs: TemplateReference[];
  selectedRef: TemplateReference | null;
  template: Template | null;
  isCreating: boolean;
  createDialogOpen: boolean;
}

export interface GenerateResult {
  success: boolean;
  message: string;
}

export interface ThemesState {
  themeRefs: ThemeReference[];
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
  generateResult: GenerateResult | null;
  saveError: string | null;
}

export interface QueueStatusState {
  isProcessing: boolean;
  queueLength: number;
}

export interface AppState {
  activeTab: TabId;
  catalogs: CatalogsState;
  templates: TemplatesState;
  themes: ThemesState;
  queueStatus: QueueStatusState;
}

export const initialAppState: AppState = {
  activeTab: 'catalogs',
  catalogs: {
    catalogRefs: [],
    selectedRef: null,
    catalog: null,
    loadedForDisplay: {},
    isCreating: false,
    createDialogOpen: false,
  },
  templates: {
    templateRefs: [],
    selectedRef: null,
    template: null,
    isCreating: false,
    createDialogOpen: false,
  },
  themes: {
    themeRefs: [],
    selectedRef: null,
    theme: null,
    checkedColorRefs: [],
    checkedContrastRefs: [],
    hueAdjustment: 0,
    hueReferenceHex: '#FF0000',
    isCreating: false,
    createDialogOpen: false,
    generateResult: null,
    saveError: null,
  },
  queueStatus: {
    isProcessing: false,
    queueLength: 0,
  },
};

export type AppStateUpdate =
  | { type: 'SET_ACTIVE_TAB'; tabId: TabId }
  | { type: 'SET_CATALOG_REFS'; refs: CatalogReference[] }
  | { type: 'SET_SELECTED_REF'; ref: CatalogReference | null }
  | { type: 'SET_CATALOG'; catalog: Catalog | null }
  | { type: 'SET_LOADED_CATALOG_FOR_DISPLAY'; name: string; version: string; catalog: Catalog | null }
  | { type: 'SET_IS_CREATING'; value: boolean }
  | { type: 'SET_CREATE_DIALOG_OPEN'; value: boolean }
  | { type: 'SET_TEMPLATE_REFS'; refs: TemplateReference[] }
  | { type: 'SET_SELECTED_TEMPLATE_REF'; ref: TemplateReference | null }
  | { type: 'SET_TEMPLATE'; template: Template | null }
  | { type: 'SET_TEMPLATE_IS_CREATING'; value: boolean }
  | { type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN'; value: boolean }
  | { type: 'SET_THEME_REFS'; refs: ThemeReference[] }
  | { type: 'SET_SELECTED_THEME_REF'; ref: ThemeReference | null }
  | { type: 'SET_THEME'; theme: Theme | null; preserveHue?: boolean }
  | { type: 'SET_THEME_AND_HUE'; theme: Theme | null; hueAdjustment: number }
  | { type: 'SET_THEME_PANE_SELECTIONS'; checkedColorRefs: string[]; checkedContrastRefs: string[] }
  | { type: 'SET_THEME_HUE_ADJUSTMENT'; value: number }
  | { type: 'SET_THEME_HUE_REFERENCE_HEX'; value: string }
  | { type: 'SET_THEME_IS_CREATING'; value: boolean }
  | { type: 'SET_THEME_CREATE_DIALOG_OPEN'; value: boolean }
  | { type: 'SET_GENERATE_RESULT'; result: GenerateResult | null }
  | { type: 'SET_THEME_SAVE_ERROR'; error: string | null }
  | { type: 'SET_QUEUE_STATUS'; isProcessing: boolean; queueLength: number };

export function appStateReducer(state: AppState, update: AppStateUpdate): AppState {
  switch (update.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: update.tabId };
    case 'SET_CATALOG_REFS':
      return { ...state, catalogs: { ...state.catalogs, catalogRefs: update.refs } };
    case 'SET_SELECTED_REF':
      return { ...state, catalogs: { ...state.catalogs, selectedRef: update.ref } };
    case 'SET_CATALOG':
      return { ...state, catalogs: { ...state.catalogs, catalog: update.catalog } };
    case 'SET_LOADED_CATALOG_FOR_DISPLAY': {
      const key = `${update.name}@${update.version}`;
      const loadedForDisplay = { ...state.catalogs.loadedForDisplay };
      if (update.catalog === null) {
        delete loadedForDisplay[key];
      } else {
        loadedForDisplay[key] = update.catalog;
      }
      return { ...state, catalogs: { ...state.catalogs, loadedForDisplay } };
    }
    case 'SET_IS_CREATING':
      return { ...state, catalogs: { ...state.catalogs, isCreating: update.value } };
    case 'SET_CREATE_DIALOG_OPEN':
      return { ...state, catalogs: { ...state.catalogs, createDialogOpen: update.value } };
    case 'SET_TEMPLATE_REFS':
      return { ...state, templates: { ...state.templates, templateRefs: update.refs } };
    case 'SET_SELECTED_TEMPLATE_REF':
      return { ...state, templates: { ...state.templates, selectedRef: update.ref } };
    case 'SET_TEMPLATE':
      return { ...state, templates: { ...state.templates, template: update.template } };
    case 'SET_TEMPLATE_IS_CREATING':
      return { ...state, templates: { ...state.templates, isCreating: update.value } };
    case 'SET_TEMPLATE_CREATE_DIALOG_OPEN':
      return { ...state, templates: { ...state.templates, createDialogOpen: update.value } };
    case 'SET_THEME_REFS':
      return { ...state, themes: { ...state.themes, themeRefs: update.refs } };
    case 'SET_SELECTED_THEME_REF':
      return { ...state, themes: { ...state.themes, selectedRef: update.ref, hueAdjustment: 0 } };
    case 'SET_THEME':
      return {
        ...state,
        themes: {
          ...state.themes,
          theme: update.theme,
          ...(update.preserveHue === true ? {} : { hueAdjustment: 0 }),
        },
      };
    case 'SET_THEME_AND_HUE':
      return {
        ...state,
        themes: { ...state.themes, theme: update.theme, hueAdjustment: update.hueAdjustment },
      };
    case 'SET_THEME_PANE_SELECTIONS':
      return {
        ...state,
        themes: {
          ...state.themes,
          checkedColorRefs: update.checkedColorRefs,
          checkedContrastRefs: update.checkedContrastRefs,
        },
      };
    case 'SET_THEME_HUE_ADJUSTMENT':
      return { ...state, themes: { ...state.themes, hueAdjustment: update.value } };
    case 'SET_THEME_HUE_REFERENCE_HEX':
      return { ...state, themes: { ...state.themes, hueReferenceHex: update.value } };
    case 'SET_THEME_IS_CREATING':
      return { ...state, themes: { ...state.themes, isCreating: update.value } };
    case 'SET_THEME_CREATE_DIALOG_OPEN':
      return { ...state, themes: { ...state.themes, createDialogOpen: update.value } };
    case 'SET_GENERATE_RESULT':
      return { ...state, themes: { ...state.themes, generateResult: update.result } };
    case 'SET_THEME_SAVE_ERROR':
      return { ...state, themes: { ...state.themes, saveError: update.error } };
    case 'SET_QUEUE_STATUS':
      return { ...state, queueStatus: { isProcessing: update.isProcessing, queueLength: update.queueLength } };
    default:
      return state;
  }
}
