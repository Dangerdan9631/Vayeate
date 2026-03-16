import type { CatalogReference } from '../../../../model/schemas';
import type { SetState } from '../types';

export function setSelectedRef(setState: SetState, ref: CatalogReference | null): void {
  setState({ type: 'SET_SELECTED_REF', ref });
}



