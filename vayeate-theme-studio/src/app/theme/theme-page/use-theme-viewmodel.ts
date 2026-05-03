import { useEffect, useMemo } from 'react';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { ThemeUiStore } from '../../../domain/state/ui/theme-ui-store';
import type { LoadState } from '../../../domain/state/ui/theme-ui-state';
import { ThemePageActionType } from './actions/theme-page-action-type';

const themeUiStore = container.resolve(ThemeUiStore);

export interface ThemeViewModel {
  pageLoadState: LoadState;
  themeLoadState: LoadState;
  isPageLoading: boolean;
  isThemeLoading: boolean;
  isThemeLoaded: boolean;
}

export function useThemeViewModel(): ThemeViewModel {
  const dispatch = useAppDispatch();
  const pageLoadState = useStore(themeUiStore.api, (state) => state.state.pageLoadState);
  const themeLoadState = useStore(themeUiStore.api, (state) => state.state.themeLoadState);
  const isPageLoading = useMemo(() => pageLoadState === 'unloaded' || pageLoadState === 'loading', [pageLoadState]);
  const isThemeLoading = useMemo(() => themeLoadState === 'loading', [themeLoadState]);
  const isThemeLoaded = useMemo(() => themeLoadState === 'loaded', [themeLoadState]);

  useEffect(() => {
    if (pageLoadState !== 'unloaded') return;
    void dispatch({ type: ThemePageActionType.PageOnLoad });
  }, [dispatch, pageLoadState]);

  return {
    pageLoadState,
    themeLoadState,
    isPageLoading,
    isThemeLoading,
    isThemeLoaded,
  };
}
