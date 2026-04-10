import { useEffect } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/components/AppProvider';
import { ThemeActionType } from '../actions/theme-action-type';
import type { Theme } from '../../../model/schemas';

let themePageLoadDispatched = false;

export function useThemeViewModel(): void {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (themePageLoadDispatched) return;
    themePageLoadDispatched = true;
    dispatch({ type: ThemeActionType.ThemePageOnLoad });
  }, [dispatch]);
}

export function useThemesPageChromeViewModel() {
  return useContextSelector(AppContext, (c) => {
    const slice = c?.state.themes;
    if (slice === undefined) {
      throw new Error('Theme state requires AppProvider.');
    }
    return { saveError: slice.saveError, createDialogOpen: slice.createDialogOpen };
  });
}

export { mergeAssignmentsFromTemplate } from '../../../domain/utils/theme-template-merge';

export function computeOrphanColorKeys(theme: Theme | null): Set<string> {
  if (!theme || !theme.templateRef) return new Set();
  return new Set<string>();
}

export function computeOrphanContrastKeys(theme: Theme | null): Set<string> {
  if (!theme || !theme.templateRef) return new Set();
  return new Set<string>();
}
