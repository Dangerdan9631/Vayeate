import {
  createContext,
  useCallback,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import { ActionQueue } from '../../actions/action-queue';
import type { AppAction } from '../../actions/action-types';
import type { Catalog } from '../../model/schemas';
import { catalogService } from '../../services/catalog-service';
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
          `(${action.catalog.sources.length} source(s))`);
        const tokens = await syncCatalogTokens(
          action.catalog.sources,
          (url) => catalogService.fetchUrl(url),
        );
        const nextVersion = nextPatchVersion(action.catalog.version);
        log.debug('sync produced', tokens.length, `token(s), bumping to v${nextVersion}`);
        const synced: Catalog = {
          ...action.catalog,
          tokens,
          version: nextVersion,
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
