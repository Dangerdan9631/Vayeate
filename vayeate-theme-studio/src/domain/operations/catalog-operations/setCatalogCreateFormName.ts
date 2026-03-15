import type { SetState } from './types';

export function setCatalogCreateFormName(setState: SetState, value: string): void {
  setState({ type: 'SET_CATALOG_CREATE_FORM_NAME', value });
}
