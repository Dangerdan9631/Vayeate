import { useCallback, useMemo } from 'react';
import { useAppDispatch } from '../../../common/context/use-app-dispatch';
import { compareVersions } from '../../../../domain/utils/compare-versions';
import type { CatalogReference } from '../../../../model/schema/template-schemas';
import { CatalogActionType } from '../../actions/catalog-action-type';
import { container } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/catalog/state/catalogs-store';
import { useStore } from 'zustand';

const catalogsStore = container.resolve(CatalogsStore);

export function useCatalogsCardViewModel() {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(catalogsStore.api, (state) => state.stateV2.selectedRef);
  const selectedName = useMemo(() => selectedRef?.name ?? '', [selectedRef]);
  const selectedVersion = useMemo(() => selectedRef?.version ?? '', [selectedRef]);

  const catalogs = useStore(catalogsStore.api, (state) => state.stateV2.catalogs);
  const catalogRefs = useMemo(() => {
    const refs: CatalogReference[] = [];
    for (const name of Object.keys(catalogs).sort()) {
      const versions = catalogs[name];
      if (!versions) continue;
      for (const version of Object.keys(versions).sort()) {
        refs.push({ name, version });
      }
    }
    return refs;
  }, [catalogs]);
  const catalogSelections = useMemo(() => {
    const map: Record<string, CatalogReference> = {};
    for (const ref of catalogRefs) {
      if (!map[ref.name] || compareVersions(map[ref.name].version, ref.version) < 0) {
        map[ref.name] = ref;
      }
    }
    return map;
  }, [catalogRefs]);
  const catalogNames = useMemo(() => {
    return Object.keys(catalogSelections).sort();
  }, [catalogSelections]);

  const catalogVersionSelections = useMemo(() => {
    const map: Record<string, CatalogReference> = {};
    if (!selectedName) return map;

    for (const ref of catalogRefs.filter((r) => r.name === selectedName)) {
      map[ref.version] = ref;
    }
    return map;
  }, [selectedName, catalogRefs]);
  const catalogVersionNames = useMemo(() => {
    return Object.keys(catalogVersionSelections).sort();
  }, [catalogVersionSelections]);

  const onCatalogsListCommit = useCallback(
    (name: string) => {
      const ref = catalogSelections[name];
      if (!ref) return;
      dispatch({ type: CatalogActionType.CatalogCatalogsListOnCommit, name: ref.name, version: ref.version });
    },
    [dispatch, catalogSelections],
  );

  const onCatalogVersionsListCommit = useCallback(
    (version: string) => {
      const ref = catalogVersionSelections[version];
      if (!ref) return;
      dispatch({ type: CatalogActionType.CatalogCatalogsListOnCommit, name: ref.name, version: ref.version });
    },
    [dispatch, catalogVersionSelections],
  );

  const onCreateCatalogClick = useCallback(() => {
    dispatch({ type: CatalogActionType.CatalogCatalogsCreateButtonOnClick });
  }, [dispatch]);

  return {
    selectedName,
    catalogNames,
    selectedVersion,
    catalogVersionNames,
    onCatalogsListCommit,
    onCatalogVersionsListCommit,
    onCreateCatalogClick,
  };
}
