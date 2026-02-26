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
import { catalogService } from '../../services/catalog-service';
import {
  appStateReducer,
  initialAppState,
  type AppState,
  type AppStateUpdate,
} from '../../state/app-state';

function createActionProcessor() {
  return async (action: AppAction, setState: (update: AppStateUpdate) => void): Promise<void> => {
    switch (action.type) {
      case 'SET_ACTIVE_TAB':
        setState({ type: 'SET_ACTIVE_TAB', tabId: action.tabId });
        break;
      case 'CREATE_CATALOG': {
        setState({ type: 'CREATE_CATALOG_START' });
        try {
          const catalog = await catalogService.createCatalog();
          setState({ type: 'CREATE_CATALOG_SUCCESS', catalog });
        } catch {
          setState({ type: 'CREATE_CATALOG_ERROR' });
        }
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
