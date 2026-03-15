import type { Catalog } from '../../../model/schemas';
import type { SetState } from './types';

export function setCatalog(setState: SetState, catalog: Catalog | null): void {
  setState({ type: 'SET_CATALOG', catalog });
}
