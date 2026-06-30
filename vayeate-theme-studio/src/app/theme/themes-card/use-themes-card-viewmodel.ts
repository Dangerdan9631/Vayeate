import { useCallback, useMemo } from 'react';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { getThemeRefs } from '../../../domain/state/data/themes-state';
import { ThemesStore } from '../../../domain/state/data/themes-store';
import { ThemeUiStore } from '../../../domain/state/ui/theme-ui-store';
import { ThemeCreateDialogStore } from '../../../domain/state/ui/theme-create-dialog-store';
import { compareVersions } from '../../../domain/utils/compare-versions';
import { ThemesCardActionType } from './actions/themes-card-action-type';
import type { ThemeReference } from '../../../model/schema/theme-schemas';

const themesStore = container.resolve(ThemesStore);
const themeUiStore = container.resolve(ThemeUiStore);
const themeCreateDialogStore = container.resolve(ThemeCreateDialogStore);

/**
 * Read model returned by useThemesCardViewModel.
 */
export interface ThemesCardViewModel {
  themeNames: string[];
  selectedName: string | null;
  versionsForSelectedName: ThemeReference[];
  selectedRef: ThemeReference | null;
  isCreating: boolean;
  canDuplicate: boolean;
  onSelectName: (name: string) => void;
  onSelectVersion: (version: string) => void;
  onCreateClick: () => void;
  onDuplicateClick: () => void;
}

/**
 * Exposes Themes Card state and dispatches user or lifecycle actions.
 * @returns View-model state and action callbacks for the component.
 */
export function useThemesCardViewModel(): ThemesCardViewModel {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(themeUiStore.api, (state) => state.state.selectedRef);
  const isCreating = useStore(themeCreateDialogStore.api, (state) => state.state.isCreating);
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

  const openDuplicateDialog = useCallback(() => {
    void dispatch({ type: ThemesCardActionType.DuplicateButtonOnClick });
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
    onDuplicateClick: openDuplicateDialog,
    isCreating,
    canDuplicate: selectedRef !== null,
  };
}
