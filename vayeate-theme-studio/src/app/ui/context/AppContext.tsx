import {
  createContext,
  useCallback,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';
import { ActionQueue } from '../../actions/action-queue';
import type { QueueStatus } from '../../actions/action-queue';
import type { AppAction } from '../../actions/action-types';
import type { AppState } from '../../../domain/state/app-state';
import {
  appStateReducer,
  initialAppState,
  type AppStateUpdate,
} from '../../../domain/state/app-state';
import { storeStateReducer, type StoreStateUpdate } from '../../../domain/state/store-state-reducer';
import { SetUiState, uiStateReducer, type UiStateUpdate } from '../../../domain/state/ui-state-reducer';
import { UiStateSetter } from '../../../domain/state/ui-state-setter';
import { AppStateSetter } from '../../../domain/state/app-state-setter';
import { AppStateGetter } from '../../../domain/state/app-state-getter';
import { StoreStateSetter } from '../../../domain/state/store-state-setter';
import { WindowStateSetter } from '../../../domain/state/window-state-setter';
import { container } from 'tsyringe';
import { windowStateReducer, type WindowStateUpdate } from '../../../domain/state/window-state-reducer';
import {
  ActiveTabContext,
  AppDispatchContext,
  CatalogsStateContext,
  EyedropperUiStateContext,
  MenuOpenStateContext,
  StoreStateContext,
  TemplatesStateContext,
  ThemesStateContext,
} from './slice-contexts';
import { UndoProvider } from './UndoContext';
import { HandlerDepsSource } from '../../di/handler-deps-source';
import type { HandlerDeps } from '../../actions/handler-types';

/** Reducer that just replaces state; each setter calls the appropriate slice reducer directly. */
function replaceStateReducer(_state: AppState, nextState: AppState): AppState {
  return nextState;
}

export interface AppContextValue {
  state: AppState;
  dispatch: (action: AppAction) => Promise<void>;
  setUiState: (update: UiStateUpdate) => void;
  setWindowState: (update: WindowStateUpdate) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, replaceState] = useReducer(
    replaceStateReducer,
    initialAppState,
    (base): AppState => {
      // Initialize colorScheme from config file (via preload synchronous IPC) to avoid a flash on startup.
      if (window.electronInitialColorScheme === 'light') {
        return { ...base, appConfig: { colorScheme: 'light' } };
      }
      return base;
    },
  );
  const stateRef = useRef(state);
  stateRef.current = state;
  const getState = useCallback(() => stateRef.current, []);

  const setState = useCallback(
    (update: AppStateUpdate) => {
      const nextState = appStateReducer(stateRef.current, update);
      flushSync(() => {
        replaceState(nextState);
      });
    },
    [],
  );

  const setWindowState = useCallback(
    (update: WindowStateUpdate) => {
      replaceState(windowStateReducer(stateRef.current, update));
    },
    [],
  );

  const setUiState: SetUiState = useCallback(
    (update: UiStateUpdate) => {
      flushSync(() => {
        replaceState(uiStateReducer(stateRef.current, update));
      });
    },
    [],
  );

  const setStoreState = useCallback(
    (update: StoreStateUpdate) => {
      const nextState = storeStateReducer(stateRef.current, update);
      flushSync(() => {
        replaceState(nextState);
      });
    },
    [],
  );

  /** Register before child useEffects run; useEffect here runs too late for CATALOG_PAGE_ON_LOAD et al. */
  const appStateSetter = useMemo(() => new AppStateSetter(setState), [setState]);
  const appStateGetter = useMemo(() => new AppStateGetter(getState), [getState]);
  const uiStateSetter = useMemo(() => new UiStateSetter(setUiState), [setUiState]);
  const storeStateSetter = useMemo(() => new StoreStateSetter(setStoreState), [setStoreState]);
  const windowStateSetter = useMemo(() => new WindowStateSetter(setWindowState), [setWindowState]);
  container.registerInstance(AppStateSetter, appStateSetter);
  container.registerInstance(AppStateGetter, appStateGetter);
  container.registerInstance(UiStateSetter, uiStateSetter);
  container.registerInstance(StoreStateSetter, storeStateSetter);
  container.registerInstance(WindowStateSetter, windowStateSetter);

  const handlerDepsRef = useRef<HandlerDeps>({
    setState,
    getState,
    setUiState,
    setStoreState,
  });
  handlerDepsRef.current = { setState, getState, setUiState, setStoreState };

  const handlerDepsSource = useMemo(() => container.resolve(HandlerDepsSource), []);
  handlerDepsSource.setGetter(() => handlerDepsRef.current);

  const queueRef = useRef<ActionQueue | null>(null);

  const dispatch = useCallback((action: AppAction): Promise<void> => {
    if (!queueRef.current) {
      const queue = container.resolve(ActionQueue);
      queue.onQueueStatus = (status: QueueStatus) =>
        setUiState({
          type: 'SET_UI_QUEUE_STATUS',
          isProcessing: status.isProcessing,
          queueLength: status.queueLength,
        });
      queueRef.current = queue;
    }
    const queue = queueRef.current!;
    return queue.enqueue(action);
  }, [setUiState]);

  const value: AppContextValue = { state, dispatch, setUiState, setWindowState };

  return (
    <AppContext.Provider value={value}>
      <AppDispatchContext.Provider value={dispatch}>
        <ActiveTabContext.Provider value={state.ui.activeTabId}>
          <MenuOpenStateContext.Provider value={state.ui.menuOpen}>
            <EyedropperUiStateContext.Provider value={state.ui.eyedropper}>
              <StoreStateContext.Provider value={state.store}>
                <CatalogsStateContext.Provider value={state.catalogs}>
                  <TemplatesStateContext.Provider value={state.templates}>
                    <ThemesStateContext.Provider value={state.themes}>
                      <UndoProvider setState={setState}>
                        {children}
                      </UndoProvider>
                    </ThemesStateContext.Provider>
                  </TemplatesStateContext.Provider>
                </CatalogsStateContext.Provider>
              </StoreStateContext.Provider>
            </EyedropperUiStateContext.Provider>
          </MenuOpenStateContext.Provider>
        </ActiveTabContext.Provider>
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  );
}