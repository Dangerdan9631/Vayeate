import {
  createContext,
  useCallback,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import { ActionQueue } from '../../actions/action-queue';
import type { AppAction } from '../../actions/action-types';
import type { Catalog, Template } from '../../model/schemas';
import { catalogService } from '../../services/catalog-service';
import { templateService } from '../../services/template-service';
import { themeService } from '../../services/theme-service';
import { syncCatalogTokens } from '../../services/catalog-sync';
import { compareVersions, nextPatchVersion } from '../../utils/version';
import { createLogger } from '../../utils/logger';
import {
  appStateReducer,
  initialAppState,
  type AppState,
  type AppStateUpdate,
} from '../../state/app-state';

const log = createLogger('AppContext');

type SetState = (update: AppStateUpdate) => void;

async function refreshRefsAndSelect(
  setState: SetState,
  selectName?: string,
  selectVersion?: string,
) {
  log.debug('refreshRefsAndSelect', selectName, selectVersion);
  const refs = await catalogService.listCatalogs();
  log.debug('loaded', refs.length, 'catalog ref(s)');
  setState({ type: 'SET_CATALOG_REFS', refs });

  if (selectName && selectVersion) {
    const match = refs.find((r) => r.name === selectName && r.version === selectVersion);
    if (match) {
      log.debug('selecting', match.name, match.version);
      setState({ type: 'SET_SELECTED_REF', ref: match });
      const loaded = await catalogService.loadCatalog(match.name, match.version);
      setState({ type: 'SET_CATALOG', catalog: loaded });
      return;
    }
    log.debug('no matching ref for', selectName, selectVersion);
  }
}

async function saveCatalogAndRefresh(catalog: Catalog, setState: SetState) {
  log.debug('saveCatalogAndRefresh', catalog.name, catalog.version);
  await catalogService.saveCatalog(catalog);
  await refreshRefsAndSelect(setState, catalog.name, catalog.version);
}

async function refreshTemplateRefsAndSelect(
  setState: SetState,
  selectName?: string,
  selectVersion?: string,
) {
  log.debug('refreshTemplateRefsAndSelect', selectName, selectVersion);
  const refs = await templateService.listTemplates();
  log.debug('loaded', refs.length, 'template ref(s)');
  setState({ type: 'SET_TEMPLATE_REFS', refs });

  if (selectName && selectVersion) {
    const match = refs.find((r) => r.name === selectName && r.version === selectVersion);
    if (match) {
      log.debug('selecting template', match.name, match.version);
      setState({ type: 'SET_SELECTED_TEMPLATE_REF', ref: match });
      const loaded = await templateService.loadTemplate(match.name, match.version);
      setState({ type: 'SET_TEMPLATE', template: loaded });
      return;
    }
    log.debug('no matching template ref for', selectName, selectVersion);
  }
}

async function saveTemplateAndRefresh(template: Template, setState: SetState) {
  log.debug('saveTemplateAndRefresh', template.name, template.version);
  await templateService.saveTemplate(template);
  await refreshTemplateRefsAndSelect(setState, template.name, template.version);
}

async function refreshThemeRefsOnly(setState: SetState) {
  log.debug('refreshThemeRefsOnly');
  const refs = await themeService.listThemes();
  log.debug('loaded', refs.length, 'theme ref(s)');
  setState({ type: 'SET_THEME_REFS', refs });
  return refs;
}

function createActionProcessor() {
  return async (action: AppAction, setState: SetState): Promise<void> => {
    switch (action.type) {
      case 'SET_ACTIVE_TAB':
        log.debug('SET_ACTIVE_TAB', action.tabId);
        setState({ type: 'SET_ACTIVE_TAB', tabId: action.tabId });
        break;

      case 'LOAD_CATALOG_REFS': {
        log.debug('LOAD_CATALOG_REFS');
        const refs = await catalogService.listCatalogs();
        log.debug('loaded', refs.length, 'catalog ref(s)');
        setState({ type: 'SET_CATALOG_REFS', refs });
        break;
      }

      case 'SELECT_CATALOG': {
        log.debug('SELECT_CATALOG', action.name, `v${action.version}`);
        const ref = { name: action.name, version: action.version };
        setState({ type: 'SET_SELECTED_REF', ref });
        const loaded = await catalogService.loadCatalog(action.name, action.version);
        log.debug('loaded catalog', loaded ? `${loaded.tokens.length} token(s)` : '(not found)');
        setState({ type: 'SET_CATALOG', catalog: loaded });
        break;
      }

      case 'OPEN_CREATE_DIALOG':
        log.debug('OPEN_CREATE_DIALOG');
        setState({ type: 'SET_CREATE_DIALOG_OPEN', value: true });
        break;

      case 'CLOSE_CREATE_DIALOG':
        log.debug('CLOSE_CREATE_DIALOG');
        setState({ type: 'SET_CREATE_DIALOG_OPEN', value: false });
        break;

      case 'CREATE_CATALOG': {
        log.debug('CREATE_CATALOG', action.params);
        setState({ type: 'SET_IS_CREATING', value: true });
        setState({ type: 'SET_CREATE_DIALOG_OPEN', value: false });
        try {
          const catalog = await catalogService.createCatalog(action.params);
          log.debug('created catalog', catalog.name, `v${catalog.version}`);
          await refreshRefsAndSelect(setState, catalog.name, catalog.version);
          setState({ type: 'SET_CATALOG', catalog });
          setState({ type: 'SET_SELECTED_REF', ref: { name: catalog.name, version: catalog.version } });
        } finally {
          setState({ type: 'SET_IS_CREATING', value: false });
        }
        break;
      }

      case 'SAVE_CATALOG': {
        log.debug('SAVE_CATALOG', action.catalog.name, `v${action.catalog.version}`);
        await saveCatalogAndRefresh(action.catalog, setState);
        break;
      }

      case 'DELETE_VERSION': {
        log.debug('DELETE_VERSION', action.name, `v${action.version}`);
        await catalogService.deleteCatalog(action.name, action.version);
        const refs = await catalogService.listCatalogs();
        setState({ type: 'SET_CATALOG_REFS', refs });

        const sameNameRefs = refs
          .filter((r) => r.name === action.name)
          .sort((a, b) => compareVersions(a.version, b.version));

        const lower = sameNameRefs.filter((r) => compareVersions(r.version, action.version) < 0);
        const higher = sameNameRefs.filter((r) => compareVersions(r.version, action.version) > 0);
        const next = lower.length > 0 ? lower[lower.length - 1] : higher.length > 0 ? higher[0] : null;

        if (next) {
          log.debug('DELETE_VERSION fallback to', next.name, `v${next.version}`);
          setState({ type: 'SET_SELECTED_REF', ref: next });
          const loaded = await catalogService.loadCatalog(next.name, next.version);
          setState({ type: 'SET_CATALOG', catalog: loaded });
        } else {
          log.debug('DELETE_VERSION no remaining versions, clearing selection');
          setState({ type: 'SET_SELECTED_REF', ref: null });
          setState({ type: 'SET_CATALOG', catalog: null });
        }
        break;
      }

      case 'UPDATE_CATALOG_SOURCES': {
        log.debug('UPDATE_CATALOG_SOURCES (no-op, handled via SAVE_CATALOG from viewmodel)');
        const currentAction = action;
        setState({ type: 'SET_CATALOG', catalog: null });
        void currentAction;
        break;
      }

      case 'LOCK_CATALOG':
        log.debug('LOCK_CATALOG (no-op, handled via SAVE_CATALOG from viewmodel)');
        break;

      case 'SYNC_CATALOG': {
        log.debug('SYNC_CATALOG', action.catalog.name, `v${action.catalog.version}`,
          `locked=${action.catalog.locked}`, `(${action.catalog.sources.length} source(s))`);
        const tokens = await syncCatalogTokens(
          action.catalog.sources,
          (url) => catalogService.fetchUrl(url),
        );
        const version = action.catalog.locked
          ? nextPatchVersion(action.catalog.version)
          : action.catalog.version;
        log.debug('sync produced', tokens.length, `token(s),`,
          action.catalog.locked ? `bumping to v${version}` : `saving to current v${version}`);
        const synced: Catalog = {
          ...action.catalog,
          tokens,
          version,
          locked: true,
        };
        await saveCatalogAndRefresh(synced, setState);
        break;
      }

      case 'ADD_TOKEN':
        log.debug('ADD_TOKEN (no-op, handled via SAVE_CATALOG from viewmodel)');
        break;
      case 'REMOVE_TOKEN':
        log.debug('REMOVE_TOKEN (no-op, handled via SAVE_CATALOG from viewmodel)');
        break;
      case 'UPDATE_TOKEN_KEY':
        log.debug('UPDATE_TOKEN_KEY (no-op, handled via SAVE_CATALOG from viewmodel)');
        break;

      case 'REVERT_TO_VERSION': {
        log.debug('REVERT_TO_VERSION', action.name, `v${action.version}`);
        const snapshot = await catalogService.loadCatalog(action.name, action.version);
        if (!snapshot) {
          log.warn('REVERT_TO_VERSION snapshot not found for', action.name, `v${action.version}`);
          break;
        }

        const refs = await catalogService.listCatalogs();
        const sameNameRefs = refs
          .filter((r) => r.name === action.name)
          .sort((a, b) => compareVersions(a.version, b.version));
        const highest = sameNameRefs.length > 0 ? sameNameRefs[sameNameRefs.length - 1] : null;

        if (highest) {
          const highestCatalog = await catalogService.loadCatalog(highest.name, highest.version);
          if (highestCatalog && !highestCatalog.locked) {
            await catalogService.saveCatalog({ ...highestCatalog, locked: true });
          }
        }

        const newVersion = highest ? nextPatchVersion(highest.version) : nextPatchVersion(action.version);
        log.debug('REVERT_TO_VERSION creating reverted catalog at', `v${newVersion}`);
        const reverted: Catalog = {
          ...snapshot,
          version: newVersion,
          locked: false,
        };
        await saveCatalogAndRefresh(reverted, setState);
        break;
      }

      case 'LOAD_TEMPLATE_REFS': {
        log.debug('LOAD_TEMPLATE_REFS');
        const tRefs = await templateService.listTemplates();
        log.debug('loaded', tRefs.length, 'template ref(s)');
        setState({ type: 'SET_TEMPLATE_REFS', refs: tRefs });
        break;
      }

      case 'SELECT_TEMPLATE': {
        log.debug('SELECT_TEMPLATE', action.name, `v${action.version}`);
        const tRef = { name: action.name, version: action.version };
        setState({ type: 'SET_SELECTED_TEMPLATE_REF', ref: tRef });
        const loadedTemplate = await templateService.loadTemplate(action.name, action.version);
        log.debug('loaded template', loadedTemplate ? `${loadedTemplate.mappings.length} mapping(s)` : '(not found)');
        setState({ type: 'SET_TEMPLATE', template: loadedTemplate });
        break;
      }

      case 'OPEN_TEMPLATE_CREATE_DIALOG':
        log.debug('OPEN_TEMPLATE_CREATE_DIALOG');
        setState({ type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN', value: true });
        break;

      case 'CLOSE_TEMPLATE_CREATE_DIALOG':
        log.debug('CLOSE_TEMPLATE_CREATE_DIALOG');
        setState({ type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN', value: false });
        break;

      case 'CREATE_TEMPLATE': {
        log.debug('CREATE_TEMPLATE', action.params);
        setState({ type: 'SET_TEMPLATE_IS_CREATING', value: true });
        setState({ type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN', value: false });
        try {
          const newTemplate = await templateService.createTemplate(action.params);
          log.debug('created template', newTemplate.name, `v${newTemplate.version}`);
          await refreshTemplateRefsAndSelect(setState, newTemplate.name, newTemplate.version);
          setState({ type: 'SET_TEMPLATE', template: newTemplate });
          setState({ type: 'SET_SELECTED_TEMPLATE_REF', ref: { name: newTemplate.name, version: newTemplate.version } });
        } finally {
          setState({ type: 'SET_TEMPLATE_IS_CREATING', value: false });
        }
        break;
      }

      case 'SAVE_TEMPLATE': {
        log.debug('SAVE_TEMPLATE', action.template.name, `v${action.template.version}`);
        await saveTemplateAndRefresh(action.template, setState);
        break;
      }

      case 'DELETE_TEMPLATE_VERSION': {
        log.debug('DELETE_TEMPLATE_VERSION', action.name, `v${action.version}`);
        await templateService.deleteTemplate(action.name, action.version);
        const tRefs = await templateService.listTemplates();
        setState({ type: 'SET_TEMPLATE_REFS', refs: tRefs });

        const sameName = tRefs
          .filter((r) => r.name === action.name)
          .sort((a, b) => compareVersions(a.version, b.version));

        const lowerT = sameName.filter((r) => compareVersions(r.version, action.version) < 0);
        const higherT = sameName.filter((r) => compareVersions(r.version, action.version) > 0);
        const nextT = lowerT.length > 0 ? lowerT[lowerT.length - 1] : higherT.length > 0 ? higherT[0] : null;

        if (nextT) {
          log.debug('DELETE_TEMPLATE_VERSION fallback to', nextT.name, `v${nextT.version}`);
          setState({ type: 'SET_SELECTED_TEMPLATE_REF', ref: nextT });
          const loadedNext = await templateService.loadTemplate(nextT.name, nextT.version);
          setState({ type: 'SET_TEMPLATE', template: loadedNext });
        } else {
          log.debug('DELETE_TEMPLATE_VERSION no remaining versions, clearing selection');
          setState({ type: 'SET_SELECTED_TEMPLATE_REF', ref: null });
          setState({ type: 'SET_TEMPLATE', template: null });
        }
        break;
      }

      case 'LOAD_THEME_REFS': {
        log.debug('LOAD_THEME_REFS');
        const thRefs = await themeService.listThemes();
        log.debug('loaded', thRefs.length, 'theme ref(s)');
        setState({ type: 'SET_THEME_REFS', refs: thRefs });
        break;
      }

      case 'SELECT_THEME': {
        log.debug('SELECT_THEME', action.name, `v${action.version}`);
        const thRef = { name: action.name, version: action.version };
        setState({ type: 'SET_SELECTED_THEME_REF', ref: thRef });
        const loadedTheme = await themeService.loadTheme(action.name, action.version);
        log.debug('loaded theme', loadedTheme
          ? `${loadedTheme.colorAssignments.length} color, ${loadedTheme.contrastAssignments.length} contrast`
          : '(not found)');
        setState({ type: 'SET_THEME', theme: loadedTheme });
        break;
      }

      case 'OPEN_THEME_CREATE_DIALOG':
        log.debug('OPEN_THEME_CREATE_DIALOG');
        setState({ type: 'SET_THEME_CREATE_DIALOG_OPEN', value: true });
        break;

      case 'CLOSE_THEME_CREATE_DIALOG':
        log.debug('CLOSE_THEME_CREATE_DIALOG');
        setState({ type: 'SET_THEME_CREATE_DIALOG_OPEN', value: false });
        break;

      case 'CREATE_THEME': {
        log.debug('CREATE_THEME', action.params);
        setState({ type: 'SET_THEME_IS_CREATING', value: true });
        setState({ type: 'SET_THEME_CREATE_DIALOG_OPEN', value: false });
        try {
          const newTheme = await themeService.createTheme(action.params);
          log.debug('created theme', newTheme.name, `v${newTheme.version}`);
          await refreshThemeRefsOnly(setState);
          setState({ type: 'SET_THEME', theme: newTheme });
          setState({ type: 'SET_SELECTED_THEME_REF', ref: { name: newTheme.name, version: newTheme.version } });
        } finally {
          setState({ type: 'SET_THEME_IS_CREATING', value: false });
        }
        break;
      }

      case 'SAVE_THEME': {
        log.debug('SAVE_THEME', action.theme.name, `v${action.theme.version}`);
        setState({ type: 'SET_THEME', theme: action.theme });
        try {
          await themeService.saveTheme(action.theme);
        } catch (err) {
          log.error('SAVE_THEME persist failed', err);
        }
        break;
      }

      case 'DELETE_THEME_VERSION': {
        log.debug('DELETE_THEME_VERSION', action.name, `v${action.version}`);
        await themeService.deleteTheme(action.name, action.version);
        const thRefs = await themeService.listThemes();
        setState({ type: 'SET_THEME_REFS', refs: thRefs });

        const sameThName = thRefs
          .filter((r) => r.name === action.name)
          .sort((a, b) => compareVersions(a.version, b.version));

        const lowerTh = sameThName.filter((r) => compareVersions(r.version, action.version) < 0);
        const higherTh = sameThName.filter((r) => compareVersions(r.version, action.version) > 0);
        const nextTh = lowerTh.length > 0 ? lowerTh[lowerTh.length - 1] : higherTh.length > 0 ? higherTh[0] : null;

        if (nextTh) {
          log.debug('DELETE_THEME_VERSION fallback to', nextTh.name, `v${nextTh.version}`);
          setState({ type: 'SET_SELECTED_THEME_REF', ref: nextTh });
          const loadedNextTh = await themeService.loadTheme(nextTh.name, nextTh.version);
          setState({ type: 'SET_THEME', theme: loadedNextTh });
        } else {
          log.debug('DELETE_THEME_VERSION no remaining versions, clearing selection');
          setState({ type: 'SET_SELECTED_THEME_REF', ref: null });
          setState({ type: 'SET_THEME', theme: null });
        }
        break;
      }

      case 'GENERATE_THEME': {
        log.debug('GENERATE_THEME', action.themeName, action.templateName);
        setState({ type: 'SET_GENERATE_RESULT', result: null });
        try {
          const { darkPath, lightPath } = await themeService.generateTheme(
            action.themeName,
            action.themeVersion,
            action.templateName,
            action.templateVersion,
          );
          setState({
            type: 'SET_GENERATE_RESULT',
            result: { success: true, message: `Generated ${darkPath} and ${lightPath}` },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          log.warn('GENERATE_THEME failed', message);
          setState({
            type: 'SET_GENERATE_RESULT',
            result: { success: false, message },
          });
        }
        break;
      }
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

  const dispatch = useCallback((action: AppAction) => {
    if (!queueRef.current) {
      log.info('initializing ActionQueue');
      const processor = createActionProcessor();
      const queue = new ActionQueue(processor);
      queue.onStateUpdate = (update) => setState(update);
      queue.onQueueStatus = (status) =>
        setState({ type: 'SET_QUEUE_STATUS', isProcessing: status.isProcessing, queueLength: status.queueLength });
      queueRef.current = queue;
    }
    queueRef.current.enqueue(action);
  }, []);

  const value: AppContextValue = { state, dispatch };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
