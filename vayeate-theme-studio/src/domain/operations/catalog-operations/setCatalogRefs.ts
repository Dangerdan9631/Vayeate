import type { CatalogReference } from '../../../model/schemas';
import type { SetState } from './types';

export function setCatalogRefs(setState: SetState, refs: CatalogReference[]): void {
  setState({ type: 'SET_CATALOG_REFS', refs });
}
