import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../../../common/context/use-app-dispatch';
import { ThemePageActionType } from './actions/theme-page-action-type';

export interface ThemeViewModel {}

export function useThemeViewModel(): ThemeViewModel {
  const dispatch = useAppDispatch();
  const pageLoadDispatchedRef = useRef(false);
  useEffect(() => {
    if (pageLoadDispatchedRef.current) return;
    pageLoadDispatchedRef.current = true;
    void dispatch({ type: ThemePageActionType.PageOnLoad });
  }, [dispatch]);

  return {};
}
