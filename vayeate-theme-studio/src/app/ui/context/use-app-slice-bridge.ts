import { useCallback, useMemo, type MutableRefObject } from 'react';
import { flushSync } from 'react-dom';
import { container } from 'tsyringe';
import type { AppState } from '../../../domain/state/app-state';

export interface UseAppSliceBridgeOptions<Update, Slice, Setter, Getter> {
  stateRef: MutableRefObject<AppState>;
  replaceState: (next: AppState) => void;
  getState: () => AppState;
  reducer: (state: AppState, update: Update) => AppState;
  /** Stable selector. */
  selectSlice: (state: AppState) => Slice;
  SetterClass: new (set: (update: Update) => void) => Setter;
  GetterClass: new (get: () => Slice) => Getter;
  setterToken: new (...args: never[]) => Setter;
  getterToken: new (...args: never[]) => Getter;
}

/**
 * Wires a slice reducer to React `useReducer` replace semantics and tsyringe setter/getter
 * registration — shared by `AppProvider` slice setup.
 */
export function useAppSliceBridge<Update, Slice, Setter, Getter>(
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
    setterToken,
    getterToken,
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

  container.registerInstance(setterToken, setter);
  container.registerInstance(getterToken, getter);
}
