import type { AppAction } from '../../core/actions/app-action';
import type { CatalogActions } from './catalog-action-type';
import { CatalogActionType } from './catalog-action-type';

const catalogTypes = new Set<string>(Object.values(CatalogActionType));

export function isCatalogAction(a: AppAction): a is CatalogActions {
  return catalogTypes.has(a.type);
}
