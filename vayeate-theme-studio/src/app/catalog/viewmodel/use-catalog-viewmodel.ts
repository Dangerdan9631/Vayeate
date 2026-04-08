import { useEffect } from 'react';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { CatalogActionType } from '../actions/catalog-action-type';

let catalogPageLoadDispatched = false;

export function useCatalogViewModel(): void {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (catalogPageLoadDispatched) return;
    catalogPageLoadDispatched = true;
    dispatch({ type: CatalogActionType.CatalogPageOnLoad });
  }, [dispatch]);
}
