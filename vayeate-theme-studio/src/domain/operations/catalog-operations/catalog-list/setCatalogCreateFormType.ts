import type { CatalogType } from '../../../../model/schemas';
import type { SetState } from '../types';

export function setCatalogCreateFormType(setState: SetState, value: CatalogType): void {
  setState({ type: 'SET_CATALOG_CREATE_FORM_TYPE', value });
}



