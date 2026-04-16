import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { CatalogActionType } from '../actions/catalog-action-type';
import { container } from 'tsyringe';
import { CatalogsStore } from '../../../domain/state/catalog/catalogs-store';
import { useStore } from 'zustand';

const catalogsStore = container.resolve(CatalogsStore);

export function useCatalogViewModel(): { createDialogOpen: boolean; bulkAddDialogOpen: boolean } {
  const dispatch = useAppDispatch();
  const pageLoadDispatchedRef = useRef(false);
  const createDialogOpen = useStore(catalogsStore.api, (state) => state.state.createDialogOpen);
  const bulkAddDialogOpen = useStore(catalogsStore.api, (state) => state.state.bulkAddDialogOpen);

  useEffect(() => {
    if (pageLoadDispatchedRef.current) return;
    pageLoadDispatchedRef.current = true;
    dispatch({ type: CatalogActionType.CatalogPageOnLoad });
  }, [dispatch]);

  return { createDialogOpen, bulkAddDialogOpen };
}
