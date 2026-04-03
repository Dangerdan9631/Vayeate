import { useCallback, useReducer, useRef, type ReactNode } from 'react';
import { createContext } from 'use-context-selector';
import { ActionQueue } from '../../actions/action-queue';
import type { AppAction } from '../../actions/action-types';
import type { AppState } from '../../../domain/state/app-state';
import { initialAppState } from '../../../domain/state/app-state';
import type { AppConfigState } from '../../../domain/state/app-config/app-config-state';
import { container } from 'tsyringe';
import { registerAppSliceBridges } from './use-app-slice-bridge';

export interface AppContextValue {
  state: AppState;
  dispatch: (action: AppAction) => Promise<void>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children, initialAppConfig }: { children: ReactNode, initialAppConfig: AppConfigState }) {
  const [state, replaceState] = useReducer(
    (_state: AppState, nextState: AppState): AppState => nextState,
    initialAppState,
    (base): AppState => ({ ...base, appConfig: initialAppConfig }),
  );
  const stateRef = useRef(state);
  stateRef.current = state;
  const getState = useCallback(() => stateRef.current, []);

  registerAppSliceBridges({ stateRef, replaceState, getState });

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
