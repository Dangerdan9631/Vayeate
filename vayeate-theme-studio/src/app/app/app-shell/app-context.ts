import { createContext } from 'use-context-selector';
import type { AppAction } from '../../core/action-queue/app-action';

/**
 * React context value exposing the action-queue dispatch callback.
 */
export interface AppContextValue {
  dispatch: (action: AppAction) => void;
}

/**
 * Context used by viewmodels to enqueue UI-originated actions.
 */
export const AppContext = createContext<AppContextValue | null>(null);
