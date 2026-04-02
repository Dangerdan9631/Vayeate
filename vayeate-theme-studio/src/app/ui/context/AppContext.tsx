import {
  createContext,
  useCallback,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import { ActionQueue } from '../../actions/action-queue';
import type { AppAction } from '../../actions/action-types';
import type { AppState } from '../../../domain/state/app-state';
import { initialAppState } from '../../../domain/state/app-state';
import {
  CatalogsStateGetter,
  CatalogsStateSetter,
  catalogsStateReducer,
} from '../../../domain/state/catalog/catalogs-state-reducer';
import {
  TemplatesStateGetter,
  TemplatesStateSetter,
  templatesStateReducer,
} from '../../../domain/state/template/templates-state-reducer';
import {
  ThemesStateGetter,
  ThemesStateSetter,
  themesStateReducer,
} from '../../../domain/state/theme/themes-state-reducer';
import {
  AppConfigStateGetter,
  AppConfigStateSetter,
  appConfigStateReducer,
} from '../../../domain/state/app-config/app-config-state-reducer';
import {
  UndoStackStateGetter,
  UndoStackStateSetter,
  undoStackStateReducer,
} from '../../../domain/state/undo-stack/undo-stack-state-reducer';
import {
  UiStateGetter,
  UiStateSetter,
  uiStateReducer,
} from '../../../domain/state/ui/ui-state-reducer';
import {
  QueueStatusStateGetter,
  QueueStatusStateSetter,
  queueStatusStateReducer,
} from '../../../domain/state/ui/queue-status-state-reducer';
import {
  WindowStateGetter,
  WindowStateSetter,
  windowStateReducer,
} from '../../../domain/state/window/window-state-reducer';
import { container } from 'tsyringe';
import {
  ActiveTabContext,
  AppDispatchContext,
  CatalogsStateContext,
  EyedropperUiStateContext,
  MenuOpenStateContext,
  TemplatesStateContext,
  ThemesStateContext,
} from './slice-contexts';
import { UndoProvider } from './UndoContext';
import { useAppSliceBridge } from './use-app-slice-bridge';

/** Reducer that just replaces state; each setter calls the appropriate slice reducer directly. */
function replaceStateReducer(_state: AppState, nextState: AppState): AppState {
  return nextState;
}

export interface AppContextValue {
  state: AppState;
  dispatch: (action: AppAction) => Promise<void>;
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

  const selectCatalogsState = (s: AppState) => s.catalogs;
  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: catalogsStateReducer,
    selectSlice: selectCatalogsState,
    SetterClass: CatalogsStateSetter,
    GetterClass: CatalogsStateGetter,
    setterToken: CatalogsStateSetter,
    getterToken: CatalogsStateGetter,
  });

  const selectTemplatesState = (s: AppState) => s.templates;
  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: templatesStateReducer,
    selectSlice: selectTemplatesState,
    SetterClass: TemplatesStateSetter,
    GetterClass: TemplatesStateGetter,
    setterToken: TemplatesStateSetter,
    getterToken: TemplatesStateGetter,
  });

  const selectThemesState = (s: AppState) => s.themes;
  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: themesStateReducer,
    selectSlice: selectThemesState,
    SetterClass: ThemesStateSetter,
    GetterClass: ThemesStateGetter,
    setterToken: ThemesStateSetter,
    getterToken: ThemesStateGetter,
  });

  const selectAppConfigState = (s: AppState) => s.appConfig;
  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: appConfigStateReducer,
    selectSlice: selectAppConfigState,
    SetterClass: AppConfigStateSetter,
    GetterClass: AppConfigStateGetter,
    setterToken: AppConfigStateSetter,
    getterToken: AppConfigStateGetter,
  });

  const selectUndoStackState = (s: AppState) => s.undoStack;
  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: undoStackStateReducer,
    selectSlice: selectUndoStackState,
    SetterClass: UndoStackStateSetter,
    GetterClass: UndoStackStateGetter,
    setterToken: UndoStackStateSetter,
    getterToken: UndoStackStateGetter,
  });

  const selectUiState = (s: AppState) => s.ui;
  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: uiStateReducer,
    selectSlice: selectUiState,
    SetterClass: UiStateSetter,
    GetterClass: UiStateGetter,
    setterToken: UiStateSetter,
    getterToken: UiStateGetter,
  });

  const selectQueueStatusState = (s: AppState) => s.ui.queueStatus;
  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: (appState, queueStatus) =>
      queueStatusStateReducer(appState, { type: 'SET_QUEUE_STATUS', queueStatus }),
    selectSlice: selectQueueStatusState,
    SetterClass: QueueStatusStateSetter,
    GetterClass: QueueStatusStateGetter,
    setterToken: QueueStatusStateSetter,
    getterToken: QueueStatusStateGetter,
  });

  const selectWindowState = (s: AppState) => s.window;
  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: windowStateReducer,
    selectSlice: selectWindowState,
    SetterClass: WindowStateSetter,
    GetterClass: WindowStateGetter,
    setterToken: WindowStateSetter,
    getterToken: WindowStateGetter,
  });

  const queueRef = useRef<ActionQueue | null>(null);

  const dispatch = useCallback((action: AppAction): Promise<void> => {
    if (!queueRef.current) {
      queueRef.current = container.resolve(ActionQueue);
    }
    return queueRef.current!.enqueue(action);
  }, []);

  const value: AppContextValue = { state, dispatch };

  return (
    <AppContext.Provider value={value}>
      <AppDispatchContext.Provider value={dispatch}>
        <ActiveTabContext.Provider value={state.ui.activeTabId}>
          <MenuOpenStateContext.Provider value={state.ui.menuOpen}>
            <EyedropperUiStateContext.Provider value={state.ui.eyedropper}>
              <CatalogsStateContext.Provider value={state.catalogs}>
                <TemplatesStateContext.Provider value={state.templates}>
                  <ThemesStateContext.Provider value={state.themes}>
                    <UndoProvider>{children}</UndoProvider>
                  </ThemesStateContext.Provider>
                </TemplatesStateContext.Provider>
              </CatalogsStateContext.Provider>
            </EyedropperUiStateContext.Provider>
          </MenuOpenStateContext.Provider>
        </ActiveTabContext.Provider>
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  );
}
