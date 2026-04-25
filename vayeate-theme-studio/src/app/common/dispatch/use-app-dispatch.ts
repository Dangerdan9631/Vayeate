import { useContextSelector } from 'use-context-selector';
import type { AppAction } from '../../core/action-queue/app-action';
import { AppContext } from '../../app/app-shell/app-context';

export function useAppDispatch(): (action: AppAction) => void {
  const dispatch = useContextSelector(AppContext, (c) => c?.dispatch);
  if (!dispatch) {
    throw new Error('useAppDispatch must be used within an AppProvider');
  }
  
  return dispatch;
}
