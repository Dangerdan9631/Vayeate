import { createContext } from 'use-context-selector';
import type { AppAction } from '../../core/components/action-queue/app-action';

export interface AppContextValue {
  dispatch: (action: AppAction) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);
