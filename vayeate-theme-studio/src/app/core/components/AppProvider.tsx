import { useCallback, useMemo, useReducer, useRef, type MutableRefObject, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { container } from 'tsyringe';
import type { AppAction } from '../actions/app-action';
import { AppContext, type AppContextValue } from '../app-context';
import type { AppState } from '../../../domain/state/app-state';
import { initialAppState } from '../../../domain/state/app-state';
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
import { ActionQueue } from '../actions/action-queue';

interface UseAppSliceBridgeOptions<Update, Slice, Setter, Getter> {
  stateRef: MutableRefObject<AppState>;
  replaceState: (next: AppState) => void;
  getState: () => AppState;
  reducer: (state: AppState, update: Update) => AppState;
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

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, replaceState] = useReducer(
    (_state: AppState, nextState: AppState): AppState => nextState,
    initialAppState,
  );
  const stateRef = useRef(state);
  stateRef.current = state;
  const getState = useCallback(() => stateRef.current, []);

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
