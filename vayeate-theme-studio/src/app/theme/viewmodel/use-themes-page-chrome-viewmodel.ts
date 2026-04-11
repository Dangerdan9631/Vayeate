import { useCallback } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/app-context';
import { ThemeActionType } from '../actions/theme-action-type';

export function useThemesPageChromeViewModel() {
  const dispatch = useAppDispatch();
  const dismissSaveError = useCallback(() => {
    void dispatch({ type: ThemeActionType.ThemePageSaveErrorDismissButtonOnClick });
  }, [dispatch]);

  const chrome = useContextSelector(AppContext, (c) => {
    const slice = c?.state.themes;
    if (slice === undefined) {
      throw new Error('Theme state requires AppProvider.');
    }
    return { saveError: slice.saveError, createDialogOpen: slice.createDialogOpen };
  });

  return { ...chrome, dismissSaveError };
}
