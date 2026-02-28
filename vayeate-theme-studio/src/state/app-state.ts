import type { Catalog, CatalogReference, Template, TemplateReference, Theme, ThemeReference } from '../model/schemas';
import type { TabId } from '../ui/tabs';
import { createLogger } from '../utils/logger';

const log = createLogger('AppState');

export interface CatalogsState {
  catalogRefs: CatalogReference[];
  selectedRef: CatalogReference | null;
  catalog: Catalog | null;
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

export interface ThemesState {
  themeRefs: ThemeReference[];
  selectedRef: ThemeReference | null;
  theme: Theme | null;
  isCreating: boolean;
  createDialogOpen: boolean;
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
    isCreating: false,
    createDialogOpen: false,
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
  | { type: 'SET_IS_CREATING'; value: boolean }
  | { type: 'SET_CREATE_DIALOG_OPEN'; value: boolean }
  | { type: 'SET_TEMPLATE_REFS'; refs: TemplateReference[] }
  | { type: 'SET_SELECTED_TEMPLATE_REF'; ref: TemplateReference | null }
  | { type: 'SET_TEMPLATE'; template: Template | null }
  | { type: 'SET_TEMPLATE_IS_CREATING'; value: boolean }
  | { type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN'; value: boolean }
  | { type: 'SET_THEME_REFS'; refs: ThemeReference[] }
  | { type: 'SET_SELECTED_THEME_REF'; ref: ThemeReference | null }
  | { type: 'SET_THEME'; theme: Theme | null }
  | { type: 'SET_THEME_IS_CREATING'; value: boolean }
  | { type: 'SET_THEME_CREATE_DIALOG_OPEN'; value: boolean }
  | { type: 'SET_QUEUE_STATUS'; isProcessing: boolean; queueLength: number };

export function appStateReducer(state: AppState, update: AppStateUpdate): AppState {
  log.debug('reduce', update.type, updatePayloadSummary(update));
  switch (update.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: update.tabId };
    case 'SET_CATALOG_REFS':
      return { ...state, catalogs: { ...state.catalogs, catalogRefs: update.refs } };
    case 'SET_SELECTED_REF':
      return { ...state, catalogs: { ...state.catalogs, selectedRef: update.ref } };
    case 'SET_CATALOG':
      return { ...state, catalogs: { ...state.catalogs, catalog: update.catalog } };
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
      return { ...state, themes: { ...state.themes, selectedRef: update.ref } };
    case 'SET_THEME':
      return { ...state, themes: { ...state.themes, theme: update.theme } };
    case 'SET_THEME_IS_CREATING':
      return { ...state, themes: { ...state.themes, isCreating: update.value } };
    case 'SET_THEME_CREATE_DIALOG_OPEN':
      return { ...state, themes: { ...state.themes, createDialogOpen: update.value } };
    case 'SET_QUEUE_STATUS':
      return { ...state, queueStatus: { isProcessing: update.isProcessing, queueLength: update.queueLength } };
    default:
      return state;
  }
}

function updatePayloadSummary(update: AppStateUpdate): string {
  switch (update.type) {
    case 'SET_ACTIVE_TAB':
      return update.tabId;
    case 'SET_CATALOG_REFS':
      return `${update.refs.length} ref(s)`;
    case 'SET_SELECTED_REF':
      return update.ref ? `${update.ref.name} v${update.ref.version}` : '(none)';
    case 'SET_CATALOG':
      return update.catalog ? `${update.catalog.name} v${update.catalog.version} (${update.catalog.tokens.length} tokens)` : '(none)';
    case 'SET_IS_CREATING':
    case 'SET_CREATE_DIALOG_OPEN':
      return String(update.value);
    case 'SET_TEMPLATE_REFS':
      return `${update.refs.length} ref(s)`;
    case 'SET_SELECTED_TEMPLATE_REF':
      return update.ref ? `${update.ref.name} v${update.ref.version}` : '(none)';
    case 'SET_TEMPLATE':
      return update.template ? `${update.template.name} v${update.template.version} (${update.template.mappings.length} mappings)` : '(none)';
    case 'SET_TEMPLATE_IS_CREATING':
    case 'SET_TEMPLATE_CREATE_DIALOG_OPEN':
      return String(update.value);
    case 'SET_THEME_REFS':
      return `${update.refs.length} ref(s)`;
    case 'SET_SELECTED_THEME_REF':
      return update.ref ? `${update.ref.name} v${update.ref.version}` : '(none)';
    case 'SET_THEME':
      return update.theme ? `${update.theme.name} v${update.theme.version} (${update.theme.colorAssignments.length} color, ${update.theme.contrastAssignments.length} contrast)` : '(none)';
    case 'SET_THEME_IS_CREATING':
    case 'SET_THEME_CREATE_DIALOG_OPEN':
      return String(update.value);
    case 'SET_QUEUE_STATUS':
      return `processing=${update.isProcessing} queue=${update.queueLength}`;
  }
}
