import { useEffect, useRef } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppContext } from '../../core/app-context';
import { CatalogActionType } from '../actions/catalog-action-type';

export function useCatalogViewModel(): { createDialogOpen: boolean; bulkAddDialogOpen: boolean } {
  const dispatch = useAppDispatch();
  const pageLoadDispatchedRef = useRef(false);
  const createDialogOpen = useContextSelector(AppContext, (c) => {
    const slice = c?.state.catalogs;
    if (slice === undefined) {
      throw new Error('Catalog state requires AppProvider.');
    }
    return slice.createDialogOpen;
  });
  const bulkAddDialogOpen = useContextSelector(AppContext, (c) => {
    const slice = c?.state.catalogs;
    if (slice === undefined) {
      throw new Error('Catalog state requires AppProvider.');
    }
    return slice.bulkAddDialogOpen;
  });

  useEffect(() => {
    if (pageLoadDispatchedRef.current) return;
    pageLoadDispatchedRef.current = true;
    dispatch({ type: CatalogActionType.CatalogPageOnLoad });
  }, [dispatch]);

  return { createDialogOpen, bulkAddDialogOpen };
}
