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
import * as windowController from '../../controllers/window-controller';
import { createLogger } from '../../utils/logger';

const log = createLogger('ActionProcessor');

type SetState = (update: AppStateUpdate) => void;

function createActionProcessor(catalogUndoPushRef: MutableRefObject<CatalogUndoPush | null>) {
  return async (action: AppAction, setState: SetState): Promise<void> => {
    log.debug('action', action);
    switch (action.type) {
      case 'TAB_BAR_ON_SELECT':
        tabController.setActiveTab(setState, action.tabId);
        break;

      case 'CATALOG_PAGE_ON_LOAD':
        await catalogController.loadCatalogRefs(setState);
        break;

      case 'TEMPLATE_PAGE_ON_ENSURE_CATALOGS_FOR_DISPLAY':
        await catalogController.loadCatalogsForDisplay(setState, action.refs);
        break;

      case 'CATALOG_LIST_ON_SELECT':
        await catalogController.selectCatalogAndLoad(
          setState,
          action.name,
          action.version,
        );
        break;

      case 'CATALOG_CREATE_DIALOG_ON_OPEN':
        catalogController.openCatalogCreateDialog(setState);
        break;

      case 'CATALOG_CREATE_DIALOG_ON_CLOSE':
        catalogController.closeCatalogCreateDialog(setState);
        break;

      case 'CATALOG_CREATE_FORM_ON_SUBMIT':
        await catalogController.createCatalog(setState, action.params);
        break;

      case 'CATALOG_SAVE_BUTTON_ON_CLICK':
        await catalogController.saveCatalog(setState, action.catalog);
        break;

      case 'CATALOG_VERSION_DELETE_BUTTON_ON_CLICK':
        await catalogController.deleteCatalogVersion(
          setState,
          action.name,
          action.version,
        );
        break;

      case 'CATALOG_SYNC_BUTTON_ON_CLICK':
        await catalogController.syncCatalog(
          setState,
          action.catalog,
          catalogUndoPushRef.current,
        );
        break;

      case 'CATALOG_REVERT_BUTTON_ON_CLICK':
        await catalogController.revertCatalogToVersion(
          setState,
          action.name,
          action.version,
        );
        break;

      case 'TEMPLATE_PAGE_ON_LOAD':
        await templateController.loadTemplateRefs(setState);
        await catalogController.loadCatalogRefs(setState);
        break;

      case 'TEMPLATE_LIST_ON_SELECT':
        await templateController.selectTemplateAndLoad(
          setState,
          action.name,
          action.version,
        );
        break;

      case 'TEMPLATE_CREATE_DIALOG_ON_OPEN':
        templateController.openTemplateCreateDialog(setState);
        break;

      case 'TEMPLATE_CREATE_DIALOG_ON_CLOSE':
        templateController.closeTemplateCreateDialog(setState);
        break;

      case 'TEMPLATE_CREATE_FORM_ON_SUBMIT':
        await templateController.createTemplate(setState, action.params);
        break;

      case 'TEMPLATE_SAVE_BUTTON_ON_CLICK':
        await templateController.saveTemplate(setState, action.template);
        break;

      case 'TEMPLATE_VERSION_DELETE_BUTTON_ON_CLICK':
        await templateController.deleteTemplateVersion(
          setState,
          action.name,
          action.version,
        );
        break;

      case 'THEME_PAGE_ON_LOAD':
        await themeController.loadThemeRefs(setState);
        break;

      case 'THEME_LIST_ON_SELECT':
        await themeController.selectThemeAndLoad(
          setState,
          action.name,
          action.version,
        );
        break;

      case 'THEME_CREATE_DIALOG_ON_OPEN':
        themeController.openThemeCreateDialog(setState);
        break;

      case 'THEME_CREATE_DIALOG_ON_CLOSE':
        themeController.closeThemeCreateDialog(setState);
        break;

      case 'THEME_CREATE_FORM_ON_SUBMIT':
        await themeController.createTheme(setState, action.params);
        break;

      case 'THEME_SAVE_BUTTON_ON_CLICK':
        themeController.saveTheme(setState, action.theme);
        break;

      case 'THEME_PANE_ON_SELECT':
        themeController.setThemePaneSelections(
          setState,
          action.checkedColorRefs,
          action.checkedContrastRefs,
        );
        break;

      case 'UNDO_PANEL_ON_RESTORE_THEME':
        await themeController.restoreThemeState(setState, {
          theme: action.theme,
          checkedColorRefs: action.checkedColorRefs,
          checkedContrastRefs: action.checkedContrastRefs,
          hueAdjustment: action.hueAdjustment,
          hueReferenceHex: action.hueReferenceHex,
          deleteThemeVersionOnRestore: action.deleteThemeVersionOnRestore,
        });
        break;

      case 'HUE_ADJUSTMENT_SLIDER_ON_DELTA':
        themeController.setThemeHueAdjustment(setState, action.value);
        break;

      case 'HUE_REFERENCE_INPUT_ON_CHANGE':
        themeController.setThemeHueReferenceHex(setState, action.value);
        break;

      case 'UNDO_PANEL_ON_RESTORE_TEMPLATE':
        await templateController.restoreTemplateState(
          setState,
          action.template,
          action.deleteTemplateVersionOnRestore,
        );
        break;

      case 'UNDO_PANEL_ON_RESTORE_CATALOG':
        await catalogController.restoreCatalogState(
          setState,
          action.catalog,
          action.deleteVersionOnRestore,
        );
        break;

      case 'THEME_VERSION_DELETE_BUTTON_ON_CLICK':
        await themeController.deleteThemeVersion(
          setState,
          action.name,
          action.version,
        );
        break;

      case 'THEME_SAVE_ERROR_DIALOG_ON_CLOSE':
        themeController.clearThemeSaveError(setState);
        break;

      case 'THEME_GENERATE_BUTTON_ON_CLICK':
        await themeController.generateTheme(
          setState,
          action.themeName,
          action.themeVersion,
          action.templateName,
          action.templateVersion,
        );
        break;

      case 'VIEW_MENU_RELOAD_ON_CLICK':
        await windowController.reloadWindow();
        break;

      case 'VIEW_MENU_FORCE_RELOAD_ON_CLICK':
        await windowController.forceReloadWindow();
        break;

      case 'VIEW_MENU_TOGGLE_DEV_TOOLS_ON_CLICK':
        await windowController.toggleDevTools();
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
