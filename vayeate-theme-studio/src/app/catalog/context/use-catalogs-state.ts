import { useContextSelector } from 'use-context-selector';
import type { CatalogsState } from '../../../domain/state/catalog/catalogs-state';
import { AppContext } from '../../core/context/AppContext';

export function useCatalogsState(): CatalogsState {
  const slice = useContextSelector(AppContext, (c) => c?.state.catalogs);
  if (slice === undefined) {
    throw new Error('useCatalogsState must be used within AppProvider');
  }
  return slice;
}
