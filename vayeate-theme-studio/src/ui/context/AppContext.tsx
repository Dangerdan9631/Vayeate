import {
  createContext,
  useCallback,
  useContext,
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
import {
  appStateReducer,
  initialAppState,
  type AppState,
  type AppStateUpdate,
} from '../../state/app-state';

type SetState = (update: AppStateUpdate) => void;

async function refreshRefsAndSelect(
  setState: SetState,
  selectName?: string,
  selectVersion?: string,
) {
  const refs = await catalogService.listCatalogs();
  setState({ type: 'SET_CATALOG_REFS', refs });

  if (selectName && selectVersion) {
    const match = refs.find((r) => r.name === selectName && r.version === selectVersion);
    if (match) {
      setState({ type: 'SET_SELECTED_REF', ref: match });
      const loaded = await catalogService.loadCatalog(match.name, match.version);
      setState({ type: 'SET_CATALOG', catalog: loaded });
      return;
    }
  }
}

async function saveCatalogAndRefresh(catalog: Catalog, setState: SetState) {
  await catalogService.saveCatalog(catalog);
  await refreshRefsAndSelect(setState, catalog.name, catalog.version);
}

function createActionProcessor() {
  return async (action: AppAction, setState: SetState): Promise<void> => {
    switch (action.type) {
      case 'SET_ACTIVE_TAB':
        setState({ type: 'SET_ACTIVE_TAB', tabId: action.tabId });
        break;

      case 'LOAD_CATALOG_REFS': {
        const refs = await catalogService.listCatalogs();
        setState({ type: 'SET_CATALOG_REFS', refs });
        break;
      }

      case 'SELECT_CATALOG': {
        const ref = { name: action.name, version: action.version };
        setState({ type: 'SET_SELECTED_REF', ref });
        const loaded = await catalogService.loadCatalog(action.name, action.version);
        setState({ type: 'SET_CATALOG', catalog: loaded });
        break;
      }

      case 'OPEN_CREATE_DIALOG':
        setState({ type: 'SET_CREATE_DIALOG_OPEN', value: true });
        break;

      case 'CLOSE_CREATE_DIALOG':
        setState({ type: 'SET_CREATE_DIALOG_OPEN', value: false });
        break;

      case 'CREATE_CATALOG': {
        setState({ type: 'SET_IS_CREATING', value: true });
        setState({ type: 'SET_CREATE_DIALOG_OPEN', value: false });
        try {
          const catalog = await catalogService.createCatalog(action.params);
          await refreshRefsAndSelect(setState, catalog.name, catalog.version);
          setState({ type: 'SET_CATALOG', catalog });
          setState({ type: 'SET_SELECTED_REF', ref: { name: catalog.name, version: catalog.version } });
        } finally {
          setState({ type: 'SET_IS_CREATING', value: false });
        }
        break;
      }

      case 'SAVE_CATALOG': {
        await saveCatalogAndRefresh(action.catalog, setState);
        break;
      }

      case 'DELETE_VERSION': {
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
          setState({ type: 'SET_SELECTED_REF', ref: next });
          const loaded = await catalogService.loadCatalog(next.name, next.version);
          setState({ type: 'SET_CATALOG', catalog: loaded });
        } else {
          setState({ type: 'SET_SELECTED_REF', ref: null });
          setState({ type: 'SET_CATALOG', catalog: null });
        }
        break;
      }

      case 'UPDATE_CATALOG_SOURCES': {
        const currentAction = action;
        setState({ type: 'SET_CATALOG', catalog: null });
        // Caller provides the current catalog via the action; 
        // we need to read from state - but we can't from the processor.
        // Instead, the viewmodel will compose the full catalog before dispatching SAVE_CATALOG.
        // This action is handled by building the catalog with new sources in the viewmodel
        // and dispatching SAVE_CATALOG. This case is a no-op fallback.
        void currentAction;
        break;
      }

      case 'LOCK_CATALOG':
        // Handled via SAVE_CATALOG with locked=true from viewmodel
        break;

      case 'SYNC_CATALOG': {
        const tokens = await syncCatalogTokens(action.catalog.sources);
        const synced: Catalog = {
          ...action.catalog,
          tokens,
          version: nextPatchVersion(action.catalog.version),
          locked: true,
        };
        await saveCatalogAndRefresh(synced, setState);
        break;
      }

      case 'ADD_TOKEN':
      case 'REMOVE_TOKEN':
      case 'UPDATE_TOKEN_KEY':
        break;

      case 'REVERT_TO_VERSION': {
        const snapshot = await catalogService.loadCatalog(action.name, action.version);
        if (!snapshot) break;

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

interface AppContextValue {
  state: AppState;
  dispatch: (action: AppAction) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useReducer(appStateReducer, initialAppState);
  const queueRef = useRef<ActionQueue | null>(null);

  const dispatch = useCallback((action: AppAction) => {
    if (!queueRef.current) {
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

export function useAppState(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return ctx;
}
