import { getCatalogRefsFromStore } from '../../state/store-state';
import type { CatalogReference } from '../../../model/schemas';
import type { AppState } from '../../state/app-state';

/** Read current catalog refs from state. Use in controllers instead of importing domain/state directly. */
export function getCatalogRefs(getState: () => AppState): CatalogReference[] {
  return getCatalogRefsFromStore(getState().store);
}
