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
import type { AppConfigState } from '../../../domain/state/app-config/app-config-state';

/** Reducer that just replaces state; each setter calls the appropriate slice reducer directly. */
function replaceStateReducer(_state: AppState, nextState: AppState): AppState {
  return nextState;
}

export interface AppContextValue {
  state: AppState;
  dispatch: (action: AppAction) => Promise<void>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children, initialAppConfig }: { children: ReactNode, initialAppConfig: AppConfigState }) {
  const [state, replaceState] = useReducer(
    replaceStateReducer,
    initialAppState,
    (base): AppState => ({ ...base, appConfig: initialAppConfig }),
  );
  const stateRef = useRef(state);
  stateRef.current = state;
  const getState = useCallback(() => stateRef.current, []);

  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: catalogsStateReducer,
    selectSlice: (s: AppState) => s.catalogs,
    SetterClass: CatalogsStateSetter,
    GetterClass: CatalogsStateGetter,
  });

  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: templatesStateReducer,
    selectSlice: (s: AppState) => s.templates,
    SetterClass: TemplatesStateSetter,
    GetterClass: TemplatesStateGetter,
  });

  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: themesStateReducer,
    selectSlice: (s: AppState) => s.themes,
    SetterClass: ThemesStateSetter,
    GetterClass: ThemesStateGetter,
  });

  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: appConfigStateReducer,
    selectSlice: (s: AppState) => s.appConfig,
    SetterClass: AppConfigStateSetter,
    GetterClass: AppConfigStateGetter,
  });

  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: undoStackStateReducer,
    selectSlice: (s: AppState) => s.undoStack,
    SetterClass: UndoStackStateSetter,
    GetterClass: UndoStackStateGetter,
  });

  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: uiStateReducer,
    selectSlice: (s: AppState) => s.ui,
    SetterClass: UiStateSetter,
    GetterClass: UiStateGetter,
  });

  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: (appState, queueStatus) =>
      queueStatusStateReducer(appState, { type: 'SET_QUEUE_STATUS', queueStatus }),
    selectSlice: (s: AppState) => s.ui.queueStatus,
    SetterClass: QueueStatusStateSetter,
    GetterClass: QueueStatusStateGetter,
  });

  useAppSliceBridge({
    stateRef,
    replaceState,
    getState,
    reducer: windowStateReducer,
    selectSlice: (s: AppState) => s.window,
    SetterClass: WindowStateSetter,
    GetterClass: WindowStateGetter,
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
