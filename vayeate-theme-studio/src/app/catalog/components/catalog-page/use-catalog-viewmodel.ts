import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../../../common/context/use-app-dispatch';
import { CatalogPageActionType } from '../catalog-page/actions/catalog-page-action-type';
import { container } from 'tsyringe';
import { CatalogsStore } from '../../../../domain/catalog/state/catalogs-store';
import { useStore } from 'zustand';

const catalogsStore = container.resolve(CatalogsStore);

export function useCatalogViewModel(): { createDialogOpen: boolean; bulkAddDialogOpen: boolean } {
  const dispatch = useAppDispatch();
  const pageLoadDispatchedRef = useRef(false);
  const createDialogOpen = useStore(catalogsStore.api, (state) => !!state.stateV2.createCatalogDialog?.isOpen);
  const bulkAddDialogOpen = useStore(catalogsStore.api, (state) => !!state.stateV2.bulkAddDialog?.isOpen);

  useEffect(() => {
    if (pageLoadDispatchedRef.current) return;
    pageLoadDispatchedRef.current = true;
    dispatch({ type: CatalogPageActionType.PageOnLoad });
  }, [dispatch]);

  return { createDialogOpen, bulkAddDialogOpen };
}
