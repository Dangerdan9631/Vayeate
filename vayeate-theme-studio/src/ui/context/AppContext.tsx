import {
  createContext,
  useCallback,
  useReducer,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import { ActionQueue } from '../../actions/action-queue';
import type { AppAction } from '../../actions/action-types';
import type { AppState } from '../../state/app-state';
import {
  appStateReducer,
  initialAppState,
  type AppStateUpdate,
} from '../../state/app-state';
import {
  ActiveTabContext,
  AppDispatchContext,
  CatalogsStateContext,
  TemplatesStateContext,
  ThemesStateContext,
} from './slice-contexts';
import { UndoProvider, type CatalogUndoPush } from './UndoContext';
import * as catalogController from '../../controllers/catalog-controller';
import * as tabController from '../../controllers/tab-controller';
import * as templateController from '../../controllers/template-controller';
import * as themeController from '../../controllers/theme-controller';
import { createLogger } from '../../utils/logger';

const log = createLogger('ActionProcessor');

type SetState = (update: AppStateUpdate) => void;

function createActionProcessor(catalogUndoPushRef: MutableRefObject<CatalogUndoPush | null>) {
  return async (action: AppAction, setState: SetState): Promise<void> => {
    log.debug('action', action);
    switch (action.type) {
      case 'TAB_BAR_ON_SELECT':
        tabController.handleTabBarOnSelect(setState, action.tabId);
        break;

      case 'CATALOG_PAGE_ON_LOAD':
        await catalogController.handleCatalogPageOnLoad(setState);
        break;

      case 'CATALOG_LOAD_FOR_DISPLAY':
        await catalogController.handleCatalogLoadForDisplay(setState, action.name, action.version);
        break;

      case 'CATALOG_LIST_ON_SELECT':
        await catalogController.handleCatalogListOnSelect(
          setState,
          action.name,
          action.version,
        );
        break;

      case 'CATALOG_CREATE_DIALOG_ON_OPEN':
        catalogController.handleCreateDialogOnOpen(setState);
        break;

      case 'CATALOG_CREATE_DIALOG_ON_CLOSE':
        catalogController.handleCreateDialogOnClose(setState);
        break;

      case 'CATALOG_CREATE_FORM_ON_SUBMIT':
        await catalogController.handleCreateFormOnSubmit(setState, action.params);
        break;

      case 'CATALOG_SAVE_BUTTON_ON_CLICK':
        await catalogController.handleSaveButtonOnClick(setState, action.catalog);
        break;

      case 'CATALOG_VERSION_DELETE_BUTTON_ON_CLICK':
        await catalogController.handleVersionDeleteButtonOnClick(
          setState,
          action.name,
          action.version,
        );
        break;

      case 'CATALOG_SYNC_BUTTON_ON_CLICK':
        await catalogController.handleSyncButtonOnClick(
          setState,
          action.catalog,
          catalogUndoPushRef.current,
        );
        break;

      case 'CATALOG_REVERT_BUTTON_ON_CLICK':
        await catalogController.handleRevertButtonOnClick(
          setState,
          action.name,
          action.version,
        );
        break;

      case 'TEMPLATE_PAGE_ON_LOAD':
        await templateController.handleTemplatePageOnLoad(setState);
        break;

      case 'TEMPLATE_LIST_ON_SELECT':
        await templateController.handleTemplateListOnSelect(
          setState,
          action.name,
          action.version,
        );
        break;

      case 'TEMPLATE_CREATE_DIALOG_ON_OPEN':
        templateController.handleCreateDialogOnOpen(setState);
        break;

      case 'TEMPLATE_CREATE_DIALOG_ON_CLOSE':
        templateController.handleCreateDialogOnClose(setState);
        break;

      case 'TEMPLATE_CREATE_FORM_ON_SUBMIT':
        await templateController.handleCreateFormOnSubmit(setState, action.params);
        break;

      case 'TEMPLATE_SAVE_BUTTON_ON_CLICK':
        await templateController.handleSaveButtonOnClick(setState, action.template);
        break;

      case 'TEMPLATE_VERSION_DELETE_BUTTON_ON_CLICK':
        await templateController.handleVersionDeleteButtonOnClick(
          setState,
          action.name,
          action.version,
        );
        break;

      case 'THEME_PAGE_ON_LOAD':
        await themeController.handleThemePageOnLoad(setState);
        break;

      case 'THEME_LIST_ON_SELECT':
        await themeController.handleThemeListOnSelect(
          setState,
          action.name,
          action.version,
        );
        break;

      case 'THEME_CREATE_DIALOG_ON_OPEN':
        themeController.handleCreateDialogOnOpen(setState);
        break;

      case 'THEME_CREATE_DIALOG_ON_CLOSE':
        themeController.handleCreateDialogOnClose(setState);
        break;

      case 'THEME_CREATE_FORM_ON_SUBMIT':
        await themeController.handleCreateFormOnSubmit(setState, action.params);
        break;

      case 'THEME_SAVE_BUTTON_ON_CLICK':
        themeController.handleSaveButtonOnClick(setState, action.theme);
        break;

      case 'THEME_PANE_ON_SELECT':
        themeController.handleThemePaneOnSelect(
          setState,
          action.checkedColorRefs,
          action.checkedContrastRefs,
        );
        break;

      case 'UNDO_PANEL_ON_RESTORE_THEME':
        await themeController.handleUndoPanelRestoreTheme(setState, {
          theme: action.theme,
          checkedColorRefs: action.checkedColorRefs,
          checkedContrastRefs: action.checkedContrastRefs,
          hueAdjustment: action.hueAdjustment,
          hueReferenceHex: action.hueReferenceHex,
          deleteThemeVersionOnRestore: action.deleteThemeVersionOnRestore,
        });
        break;

      case 'HUE_ADJUSTMENT_SLIDER_ON_DELTA':
        themeController.handleHueAdjustmentSliderOnDelta(setState, action.value);
        break;

      case 'HUE_REFERENCE_INPUT_ON_CHANGE':
        themeController.handleHueReferenceInputOnChange(setState, action.value);
        break;

      case 'UNDO_PANEL_ON_RESTORE_TEMPLATE':
        await templateController.handleUndoPanelRestoreTemplate(
          setState,
          action.template,
          action.deleteTemplateVersionOnRestore,
        );
        break;

      case 'UNDO_PANEL_ON_RESTORE_CATALOG':
        await catalogController.handleUndoPanelRestoreCatalog(
          setState,
          action.catalog,
          action.deleteVersionOnRestore,
        );
        break;

      case 'THEME_VERSION_DELETE_BUTTON_ON_CLICK':
        await themeController.handleVersionDeleteButtonOnClick(
          setState,
          action.name,
          action.version,
        );
        break;

      case 'THEME_SAVE_ERROR_DIALOG_ON_CLOSE':
        themeController.handleSaveErrorDialogOnClose(setState);
        break;

      case 'THEME_GENERATE_BUTTON_ON_CLICK':
        await themeController.handleGenerateButtonOnClick(
          setState,
          action.themeName,
          action.themeVersion,
          action.templateName,
          action.templateVersion,
        );
        break;
    }
  };
}

export interface AppContextValue {
  state: AppState;
  dispatch: (action: AppAction) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useReducer(appStateReducer, initialAppState);
  const queueRef = useRef<ActionQueue | null>(null);
  const catalogUndoPushRef = useRef<CatalogUndoPush | null>(null);

  const dispatch = useCallback((action: AppAction) => {
    if (!queueRef.current) {
      const processor = createActionProcessor(catalogUndoPushRef);
      const queue = new ActionQueue(processor);
      queue.onStateUpdate = (update) => setState(update);
      queue.onQueueStatus = (status) =>
        setState({
          type: 'SET_QUEUE_STATUS',
          isProcessing: status.isProcessing,
          queueLength: status.queueLength,
        });
      queueRef.current = queue;
    }
    queueRef.current.enqueue(action);
  }, []);

  const value: AppContextValue = { state, dispatch };

  return (
    <AppContext.Provider value={value}>
      <AppDispatchContext.Provider value={dispatch}>
        <ActiveTabContext.Provider value={state.activeTab}>
          <CatalogsStateContext.Provider value={state.catalogs}>
            <TemplatesStateContext.Provider value={state.templates}>
              <ThemesStateContext.Provider value={state.themes}>
                <UndoProvider catalogUndoPushRef={catalogUndoPushRef}>
                  {children}
                </UndoProvider>
              </ThemesStateContext.Provider>
            </TemplatesStateContext.Provider>
          </CatalogsStateContext.Provider>
        </ActiveTabContext.Provider>
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  );
}
