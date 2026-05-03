import { useCallback } from 'react';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { ThemeUiStore } from '../../../domain/state/ui/theme-ui-store';
import { ThemeCreateDialogStore } from '../../../domain/state/ui/theme-create-dialog-store';
import { ThemePageActionType } from './actions/theme-page-action-type';

const themeUiStore = container.resolve(ThemeUiStore);
const themeCreateDialogStore = container.resolve(ThemeCreateDialogStore);

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

  const saveError = useStore(themeUiStore.api, (state) => state.state.saveError);
  const createDialogOpen = useStore(themeCreateDialogStore.api, (state) => state.state.isOpen);

  return { saveError, createDialogOpen, onDismissSaveErrorClick };
}
