import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { CatalogPageActionType } from './actions/catalog-page-action-type';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { CreateCatalogDialogStore } from '../../../domain/state/create-dialog/create-catalog-dialog-store';
import { BulkAddDialogStore } from '../../../domain/state/bulk-add-dialog/bulk-add-dialog-store';

const createCatalogDialogStore = container.resolve(CreateCatalogDialogStore);
const bulkAddDialogStore = container.resolve(BulkAddDialogStore);

export interface CatalogViewModel {
  createDialogOpen: boolean;
  bulkAddDialogOpen: boolean;
}

export function useCatalogViewModel(): CatalogViewModel {
  const dispatch = useAppDispatch();
  const pageLoadDispatchedRef = useRef(false);
  const createDialogOpen = useStore(createCatalogDialogStore.api, (state) => !!state.state?.isOpen);
  const bulkAddDialogOpen = useStore(bulkAddDialogStore.api, (state) => !!state.state?.isOpen);

  useEffect(() => {
    if (pageLoadDispatchedRef.current) return;
    pageLoadDispatchedRef.current = true;
    void dispatch({ type: CatalogPageActionType.PageOnLoad });
  }, [dispatch]);

  return { createDialogOpen, bulkAddDialogOpen };
}
