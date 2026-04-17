import { useCallback, useMemo } from 'react';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { getCatalogRefsFromCatalogMap } from '../../../domain/state/catalog/catalogs-state';
import { compareVersions } from '../../../domain/utils/compare-versions';
import type { CatalogReference } from '../../../model/schema/template-schemas';
import { CatalogActionType } from '../actions/catalog-action-type';
import { container } from 'tsyringe';
import { CatalogsStore } from '../../../domain/state/catalog/catalogs-store';
import { useStore } from 'zustand';

const catalogsStore = container.resolve(CatalogsStore);

export function useCatalogsCardViewModel() {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(catalogsStore.api, (state) => state.state.selectedRef);
  const isCreating = useStore(catalogsStore.api, (state) => state.state.isCreating);
  const catalogMap = useStore(catalogsStore.api, (state) => state.state.catalogMap);
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
