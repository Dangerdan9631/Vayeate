import { createContext } from 'use-context-selector';
import type { AppAction } from './actions/app-action';

export interface AppContextValue {
  dispatch: (action: AppAction) => Promise<void>;
}

export const AppContext = createContext<AppContextValue | null>(null);
