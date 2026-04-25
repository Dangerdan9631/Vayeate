import { useCallback, useMemo } from 'react';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../common/dispatch/use-app-dispatch';
import { getThemeRefs } from '../../../domain/state/theme/themes-state';
import { ThemesStore } from '../../../domain/state/theme/themes-store';
import { compareVersions } from '../../../domain/utils/compare-versions';
import { ThemesCardActionType } from './actions/themes-card-action-type';
import type { ThemeReference } from '../../../model/schema/theme-schemas';

const themesStore = container.resolve(ThemesStore);

export interface ThemesCardViewModel {
  themeNames: string[];
  selectedName: string | null;
  versionsForSelectedName: ThemeReference[];
  selectedRef: ThemeReference | null;
  isCreating: boolean;
  onSelectName: (name: string) => void;
  onSelectVersion: (version: string) => void;
  onCreateClick: () => void;
}

export function useThemesCardViewModel(): ThemesCardViewModel {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(themesStore.api, (state) => state.state.selectedRef);
  const isCreating = useStore(themesStore.api, (state) => state.state.isCreating);
  const themeMap = useStore(themesStore.api, (state) => state.state.themeMap);
  const themeRefs = useMemo(() => getThemeRefs(themeMap), [themeMap]);

  const themeNames = useMemo(() => {
    const names = new Set(themeRefs.map((r) => r.name));
    return [...names].sort();
  }, [themeRefs]);

  const selectedName = useMemo(() => selectedRef?.name ?? null, [selectedRef]);

  const versionsForSelectedName = useMemo(() => {
    if (!selectedName) return [];
    return themeRefs
      .filter((r) => r.name === selectedName)
      .sort((a, b) => compareVersions(b.version, a.version));
  }, [themeRefs, selectedName]);

  const selectTheme = useCallback(
    (name: string, version: string) => {
      void dispatch({ type: ThemesCardActionType.VersionListOnCommit, name, version });
    },
    [dispatch],
  );

  const selectName = useCallback(
    (name: string) => {
      if (!name) return;
      void dispatch({ type: ThemesCardActionType.NameListOnCommit, name });
    },
    [dispatch],
  );

  const openCreateDialog = useCallback(() => {
    void dispatch({ type: ThemesCardActionType.CreateButtonOnClick });
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
