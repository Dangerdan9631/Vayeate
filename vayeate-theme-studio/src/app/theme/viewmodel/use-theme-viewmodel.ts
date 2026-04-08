import { useEffect } from 'react';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
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

export { mergeAssignmentsFromTemplate } from '../../../domain/utils/theme-template-merge';

export function computeOrphanColorKeys(theme: Theme | null): Set<string> {
  if (!theme || !theme.templateRef) return new Set();
  return new Set<string>();
}

export function computeOrphanContrastKeys(theme: Theme | null): Set<string> {
  if (!theme || !theme.templateRef) return new Set();
  return new Set<string>();
}
