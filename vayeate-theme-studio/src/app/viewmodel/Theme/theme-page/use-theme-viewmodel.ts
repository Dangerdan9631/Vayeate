import { useEffect, useMemo } from 'react';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../../core/Queue/action-queue/use-app-dispatch';
import { ThemeUiStore } from '../../../../domain/state/Theme/ui/theme-ui-store';
import type { LoadState } from '../../../../domain/state/Theme/ui/theme-ui-state';
import { ThemePageActionType } from '../../../actions/Theme/theme-page/theme-page-action-type';

const themeUiStore = container.resolve(ThemeUiStore);

/**
 * Read model returned by useThemeViewModel.
 */
export interface ThemeViewModel {
  pageLoadState: LoadState;
  themeLoadState: LoadState;
  isPageLoading: boolean;
  isThemeLoading: boolean;
  isThemeLoaded: boolean;
}

/**
 * Exposes Theme Page state and dispatches user or lifecycle actions.
 * @returns View-model state and action callbacks for the component.
 */
export function useThemeViewModel(): ThemeViewModel {
  const dispatch = useAppDispatch();
  const pageLoadState = useStore(themeUiStore.api, (state) => state.state.pageLoadState);
  const themeLoadState = useStore(themeUiStore.api, (state) => state.state.themeLoadState);
  const isPageLoading = useMemo(() => pageLoadState === 'unloaded' || pageLoadState === 'loading', [pageLoadState]);
  const isThemeLoading = useMemo(() => themeLoadState === 'loading', [themeLoadState]);
  const isThemeLoaded = useMemo(() => themeLoadState === 'loaded', [themeLoadState]);

  useEffect(() => {
    void dispatch({ type: ThemePageActionType.PageOnLoad });
    return () => {
      void dispatch({ type: ThemePageActionType.PageOnUnload });
    };
  }, [dispatch]);

  return {
    pageLoadState,
    themeLoadState,
    isPageLoading,
    isThemeLoading,
    isThemeLoaded,
  };
}
