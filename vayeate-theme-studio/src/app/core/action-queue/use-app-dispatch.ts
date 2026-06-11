import { useContextSelector } from 'use-context-selector';
import type { AppAction } from './app-action';
import { AppContext } from '../../app/app-shell/app-context';

/**
 * Returns the app-shell dispatch function that enqueues actions into `ActionQueue`.
 * Must be called from a component wrapped by `AppProvider`.
 *
 * @returns A callback that accepts an `AppAction` and enqueues it.
 */
export function useAppDispatch(): (action: AppAction) => void {
  const dispatch = useContextSelector(AppContext, (c) => c?.dispatch);
  if (!dispatch) {
    throw new Error('useAppDispatch must be used within an AppProvider');
  }

  return dispatch;
}
