import { useCallback, useMemo } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/components/AppProvider';
import { getCatalogRefsFromCatalogMap } from '../../../domain/state/catalog/catalogs-state';
import { compareVersions } from '../../../domain/utils/version';
import type { CatalogReference } from '../../../model/schemas';
import { CatalogActionType } from '../actions/catalog-action-type';

export function useCatalogsCardViewModel() {
  const dispatch = useAppDispatch();
  const { selectedRef, isCreating, catalogMap } = useContextSelector(AppContext, (c) => {
    const slice = c?.state.catalogs;
    if (slice === undefined) {
      throw new Error('Catalog state requires AppProvider.');
    }
    return slice;
  });
  const catalogRefs = useMemo(() => getCatalogRefsFromCatalogMap(catalogMap), [catalogMap]);

  const catalogNames = useMemo(() => {
    const names = new Set(catalogRefs.map((r) => r.name));
    return [...names].sort();
  }, [catalogRefs]);

  const selectedName = selectedRef?.name ?? null;

  const versionsForSelectedName = useMemo(() => {
    if (!selectedName) return [];
    return catalogRefs
      .filter((r) => r.name === selectedName)
      .sort((a, b) => compareVersions(b.version, a.version));
  }, [catalogRefs, selectedName]);

  const highestVersionForName = useCallback(
    (name: string): CatalogReference | null => {
      const refs = catalogRefs.filter((r) => r.name === name);
      if (refs.length === 0) return null;
      return refs.reduce((best, r) => (compareVersions(r.version, best.version) > 0 ? r : best));
    },
    [catalogRefs],
  );

  const selectCatalog = useCallback(
    (name: string, version: string) => {
      dispatch({ type: CatalogActionType.CatalogCatalogsListOnCommit, name, version });
    },
    [dispatch],
  );

  const selectName = useCallback(
    (name: string) => {
      const best = highestVersionForName(name);
      if (best) {
        dispatch({ type: CatalogActionType.CatalogCatalogsListOnCommit, name: best.name, version: best.version });
      }
    },
    [dispatch, highestVersionForName],
  );

  const openCreateDialog = useCallback(() => {
    dispatch({ type: CatalogActionType.CatalogCatalogsCreateButtonOnClick });
    dispatch({ type: CatalogActionType.CatalogCreateDialogOnOpen });
  }, [dispatch]);

  const onSelectVersion = useCallback(
    (version: string) => {
      if (selectedName) selectCatalog(selectedName, version);
    },
    [selectCatalog, selectedName],
  );

  return {
    catalogNames,
    selectedName,
    versionsForSelectedName,
    selectedRef,
    onSelectName: selectName,
    onSelectVersion,
    onCreateClick: openCreateDialog,
    isCreating,
  };
}
