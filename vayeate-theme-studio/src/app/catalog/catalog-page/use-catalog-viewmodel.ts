import { useEffect, useMemo } from 'react';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { CatalogPageActionType } from './actions/catalog-page-action-type';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { CreateCatalogDialogStore } from '../../../domain/state/ui/create-catalog-dialog-store';
import { BulkAddDialogStore } from '../../../domain/state/ui/bulk-add-dialog-store';
import { CatalogUiStore } from '../../../domain/state/ui/catalog-ui-store';
import type { LoadState } from '../../../domain/state/ui/catalog-ui-state';

const createCatalogDialogStore = container.resolve(CreateCatalogDialogStore);
const bulkAddDialogStore = container.resolve(BulkAddDialogStore);
const catalogUiStore = container.resolve(CatalogUiStore);

export interface CatalogViewModel {
  pageLoadState: LoadState;
  catalogLoadState: LoadState;
  isPageLoading: boolean;
  isCatalogLoading: boolean;
  isCatalogLoaded: boolean;
  createDialogOpen: boolean;
  bulkAddDialogOpen: boolean;
}

export function useCatalogViewModel(): CatalogViewModel {
  const dispatch = useAppDispatch();
  const pageLoadState = useStore(catalogUiStore.api, (state) => state.state.pageLoadState);
  const catalogLoadState = useStore(catalogUiStore.api, (state) => state.state.catalogLoadState);
  const createDialogOpen = useStore(createCatalogDialogStore.api, (state) => !!state.state?.isOpen);
  const bulkAddDialogOpen = useStore(bulkAddDialogStore.api, (state) => !!state.state?.isOpen);
  const isPageLoading = useMemo(() => pageLoadState === 'unloaded' || pageLoadState === 'loading', [pageLoadState]);
  const isCatalogLoading = useMemo(() => catalogLoadState === 'loading', [catalogLoadState]);
  const isCatalogLoaded = useMemo(() => catalogLoadState === 'loaded', [catalogLoadState]);

  useEffect(() => {
    if (pageLoadState !== 'unloaded') return;
    void dispatch({ type: CatalogPageActionType.PageOnLoad });
  }, [dispatch, pageLoadState]);

  return {
    pageLoadState,
    catalogLoadState,
    isPageLoading,
    isCatalogLoading,
    isCatalogLoaded,
    createDialogOpen,
    bulkAddDialogOpen,
  };
}
