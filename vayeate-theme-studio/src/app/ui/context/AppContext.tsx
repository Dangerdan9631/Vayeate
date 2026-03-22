import { createContext, useCallback, useEffect, useReducer, useRef, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { ActionQueue } from '../../actions/action-queue';
import type { AppActionV2 } from '../../actions/action-types';
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
import { container } from 'tsyringe';
import { windowStateReducer, type WindowStateUpdate } from '../../../domain/state/window-state-reducer';
import {
  ActiveTabContext,
  AppDispatchContext,
  CatalogsStateContext,
  StoreStateContext,
  TemplatesStateContext,
  ThemesStateContext,
} from './slice-contexts';
import { UndoProvider } from './UndoContext';
import { createActionProcessor } from '../../handlers/handler-registry';
import { getWindowEventTransport } from './window-event-transport';

/** Reducer that just replaces state; each setter calls the appropriate slice reducer directly. */
function replaceStateReducer(_state: AppState, nextState: AppState): AppState {
  return nextState;
}

export interface AppContextValue {
  state: AppState;
  dispatch: (action: AppActionV2) => Promise<void>;
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
  useEffect(() => {
    container.registerInstance(AppStateSetter, new AppStateSetter(setState));
  }, [setState]);

  useEffect(() => {
    container.registerInstance(AppStateGetter, new AppStateGetter(getState));
  }, [getState]);

  const setWindowState = useCallback(
    (update: WindowStateUpdate) => {
      replaceState(windowStateReducer(stateRef.current, update));
    },
    [],
  );

  const setUiState: SetUiState = useCallback(
    (update: UiStateUpdate) => {
      replaceState(uiStateReducer(stateRef.current, update));
    },
    [],
  );

  useEffect(() => {
    container.registerInstance(UiStateSetter, new UiStateSetter(setUiState));
  }, [setUiState]);

  const setStoreState = useCallback(
    (update: StoreStateUpdate) => {
      const nextState = storeStateReducer(stateRef.current, update);
      flushSync(() => {
        replaceState(nextState);
      });
    },
    [],
  );

  useEffect(() => {
    container.registerInstance(StoreStateSetter, new StoreStateSetter(setStoreState));
  }, [setStoreState]);

  const queueRef = useRef<ActionQueue | null>(null);

  useEffect(() => {
    const transport = getWindowEventTransport();
    const unsubscribes: Array<() => void> = [];
    if (transport.onWindowState) {
      unsubscribes.push(
        transport.onWindowState((event) => {
          switch (event) {
            case 'minimized':
              setWindowState({ type: 'SET_WINDOW_MINIMIZED', value: true });
              break;
            case 'maximized':
              setWindowState({ type: 'SET_WINDOW_MAXIMIZED', value: true });
              break;
            case 'unmaximized':
              setWindowState({ type: 'SET_WINDOW_MAXIMIZED', value: false });
              break;
            case 'restored':
              setWindowState({ type: 'SET_WINDOW_MINIMIZED', value: false });
              break;
          }
        }) ?? (() => {}),
      );
    }
    if (transport.onWindowResize) {
      unsubscribes.push(
        transport.onWindowResize((size) => setWindowState({ type: 'SET_WINDOW_SIZE', size })) ??
          (() => {}),
      );
    }
    if (transport.onWindowMove) {
      unsubscribes.push(
        transport.onWindowMove((position) =>
          setWindowState({ type: 'SET_WINDOW_POSITION', position })
        ) ?? (() => {}),
      );
    }
    return () => {
      unsubscribes.forEach((fn) => fn());
    };
  }, [setWindowState]);

  const dispatch = useCallback((action: AppActionV2): Promise<void> => {
    if (!queueRef.current) {
      const processor = createActionProcessor({ setState, getState, setUiState, setStoreState });
      const queue = new ActionQueue(processor);
      queue.onQueueStatus = (status) =>
        setUiState({
          type: 'SET_UI_QUEUE_STATUS',
          isProcessing: status.isProcessing,
          queueLength: status.queueLength,
        });
      queueRef.current = queue;
    }
    return queueRef.current.enqueue(action);
  }, [getState, setState, setUiState, setStoreState]);

  const value: AppContextValue = { state, dispatch, setUiState, setWindowState };

  return (
    <AppContext.Provider value={value}>
      <AppDispatchContext.Provider value={dispatch}>
        <ActiveTabContext.Provider value={state.ui.activeTabId}>
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
        </ActiveTabContext.Provider>
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  );
}