import { useContextSelector } from 'use-context-selector';
import type { AppAction } from '../../core/actions/app-action';
import { AppContext } from '../../core/app-context';

export function useAppDispatch(): (action: AppAction) => Promise<void> {
  const dispatch = useContextSelector(AppContext, (c) => c?.dispatch);
  return dispatch ?? (() => Promise.resolve());
}
