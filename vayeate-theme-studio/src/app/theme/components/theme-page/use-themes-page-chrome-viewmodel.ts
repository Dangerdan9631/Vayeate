import { useCallback } from 'react';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../../common/context/use-app-dispatch';
import { ThemesStore } from '../../../../domain/state/theme/themes-store';
import { ThemePageActionType } from './actions/theme-page-action-type';

const themesStore = container.resolve(ThemesStore);

export interface ThemesPageChromeViewModel {
  saveError: string | null;
  createDialogOpen: boolean;
  onDismissSaveErrorClick: () => void;
}

export function useThemesPageChromeViewModel(): ThemesPageChromeViewModel {
  const dispatch = useAppDispatch();
  const onDismissSaveErrorClick = useCallback(() => {
    void dispatch({ type: ThemePageActionType.PageSaveErrorDismissButtonOnClick });
  }, [dispatch]);

  const saveError = useStore(themesStore.api, (state) => state.state.saveError);
  const createDialogOpen = useStore(themesStore.api, (state) => state.state.createDialogOpen);

  return { saveError, createDialogOpen, onDismissSaveErrorClick };
}
