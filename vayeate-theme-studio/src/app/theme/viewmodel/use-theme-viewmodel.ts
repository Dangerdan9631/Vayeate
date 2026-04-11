import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { ThemeActionType } from '../actions/theme-action-type';

export function useThemeViewModel(): void {
  const dispatch = useAppDispatch();
  const pageLoadDispatchedRef = useRef(false);
  useEffect(() => {
    if (pageLoadDispatchedRef.current) return;
    pageLoadDispatchedRef.current = true;
    dispatch({ type: ThemeActionType.ThemePageOnLoad });
  }, [dispatch]);
}
