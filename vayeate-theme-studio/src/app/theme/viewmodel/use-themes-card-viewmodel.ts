import { useCallback, useMemo } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/app-context';
import { getThemeRefs } from '../../../domain/state/theme/themes-state';
import { compareVersions } from '../../../domain/utils/compare-versions';
import { ThemeActionType } from '../actions/theme-action-type';

export function useThemesCardViewModel() {
  const dispatch = useAppDispatch();
  const { selectedRef, isCreating, themeMap } = useContextSelector(AppContext, (c) => {
    const slice = c?.state.themes;
    if (slice === undefined) {
      throw new Error('Theme state requires AppProvider.');
    }
    return slice;
  });
  const themeRefs = useMemo(() => getThemeRefs(themeMap), [themeMap]);

  const themeNames = useMemo(() => {
    const names = new Set(themeRefs.map((r) => r.name));
    return [...names].sort();
  }, [themeRefs]);

  const selectedName = selectedRef?.name ?? null;

  const versionsForSelectedName = useMemo(() => {
    if (!selectedName) return [];
    return themeRefs
      .filter((r) => r.name === selectedName)
      .sort((a, b) => compareVersions(b.version, a.version));
  }, [themeRefs, selectedName]);

  const selectTheme = useCallback(
    (name: string, version: string) => {
      dispatch({ type: ThemeActionType.ThemeThemesVersionListOnCommit, name, version });
    },
    [dispatch],
  );

  const selectName = useCallback(
    (name: string) => {
      dispatch({ type: ThemeActionType.ThemeThemesNameListOnCommit, name });
    },
    [dispatch],
  );

  const openCreateDialog = useCallback(() => {
    dispatch({ type: ThemeActionType.ThemeThemesCreateButtonOnClick });
  }, [dispatch]);

  const onSelectVersion = useCallback(
    (version: string) => {
      if (selectedName) selectTheme(selectedName, version);
    },
    [selectTheme, selectedName],
  );

  return {
    themeNames,
    selectedName,
    versionsForSelectedName,
    selectedRef,
    onSelectName: selectName,
    onSelectVersion,
    onCreateClick: openCreateDialog,
    isCreating,
  };
}
