import { createContext } from 'use-context-selector';
import type { AppAction } from './actions/app-action';
import type { AppState } from '../../domain/state/app-state';

export interface AppContextValue {
  state: AppState;
  dispatch: (action: AppAction) => Promise<void>;
}

export const AppContext = createContext<AppContextValue | null>(null);
