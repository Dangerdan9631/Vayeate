import { useCallback, useMemo } from 'react';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { compareVersions } from '../../../domain/utils/compare-versions';
import type { CatalogReference } from '../../../model/schema/template-schemas';
import { CatalogsCardActionType } from './actions/catalogs-card-action-type';
import { container } from 'tsyringe';
import { CatalogsStore, getCurrentCatalogRefs } from '../../../domain/catalog/state/catalogs-store';
import { CatalogUiStore } from '../../../domain/state/ui/catalog-ui-store';
import { useStore } from 'zustand';

const catalogsStore = container.resolve(CatalogsStore);
const catalogUiStore = container.resolve(CatalogUiStore);

export interface CatalogsCardViewModel {
  selectedName: string;
  selectedVersion: string;
  catalogNames: string[];
  catalogVersionNames: string[];
  onCatalogsListCommit: (name: string) => void;
  onCatalogVersionsListCommit: (version: string) => void;
  onCreateCatalogClick: () => void;
}

export function useCatalogsCardViewModel(): CatalogsCardViewModel {
  const dispatch = useAppDispatch();
  const selectedRef = useStore(catalogUiStore.api, (state) => state.state.selectedRef);
  const selectedName = useMemo(() => selectedRef?.name ?? '', [selectedRef]);
  const selectedVersion = useMemo(() => selectedRef?.version ?? '', [selectedRef]);

  const catalogs = useStore(catalogsStore.api, (state) => state.state.catalogs);
  const catalogRefs = useMemo(() => getCurrentCatalogRefs(catalogs), [catalogs]);
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
      void dispatch({ type: CatalogsCardActionType.CatalogsListOnCommit, name: ref.name, version: ref.version });
    },
    [dispatch, catalogSelections],
  );

  const onCatalogVersionsListCommit = useCallback(
    (version: string) => {
      const ref = catalogVersionSelections[version];
      if (!ref) return;
      void dispatch({ type: CatalogsCardActionType.CatalogVersionsListOnCommit, name: ref.name, version: ref.version });
    },
    [dispatch, catalogVersionSelections],
  );

  const onCreateCatalogClick = useCallback(() => {
    void dispatch({ type: CatalogsCardActionType.CatalogsCreateButtonOnClick });
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
