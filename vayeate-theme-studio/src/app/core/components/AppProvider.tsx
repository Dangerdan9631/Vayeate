import { useCallback, useMemo, useReducer, useRef, type MutableRefObject, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { container } from 'tsyringe';
import { ActionQueue } from '../actions/action-queue';
import type { AppAction } from '../actions/app-action';
import { AppContext, type AppContextValue } from '../app-context';
import type { AppState } from '../../../domain/state/app-state';
import { initialAppState } from '../../../domain/state/app-state';
import type { AppConfigState } from '../../../domain/state/app-config/app-config-state';
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

interface UseAppSliceBridgeOptions<Update, Slice, Setter, Getter> {
  stateRef: MutableRefObject<AppState>;
  replaceState: (next: AppState) => void;
  getState: () => AppState;
  reducer: (state: AppState, update: Update) => AppState;
  /** Stable selector. */
  selectSlice: (state: AppState) => Slice;
  SetterClass: new (set: (update: Update) => void) => Setter;
  GetterClass: new (get: () => Slice) => Getter;
}

function useAppSliceBridge<Update, Slice, Setter, Getter>(
  options: UseAppSliceBridgeOptions<Update, Slice, Setter, Getter>,
): void {
  const {
    stateRef,
    replaceState,
    getState,
    reducer,
    selectSlice,
    SetterClass,
    GetterClass,
  } = options;

  const setState = useCallback(
    (update: Update) => {
      flushSync(() => replaceState(reducer(stateRef.current, update)));
    },
    [reducer, replaceState, stateRef],
  );

  const setter = useMemo(() => new SetterClass(setState), [SetterClass, setState]);
  const getter = useMemo(
    () => new GetterClass(() => selectSlice(getState())),
    [GetterClass, getState, selectSlice],
  );

  container.registerInstance(SetterClass, setter);
  container.registerInstance(GetterClass, getter);
}

export function AppProvider({ children, initialAppConfig }: { children: ReactNode; initialAppConfig: AppConfigState }) {
  const [state, replaceState] = useReducer(
    (_state: AppState, nextState: AppState): AppState => nextState,
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

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
