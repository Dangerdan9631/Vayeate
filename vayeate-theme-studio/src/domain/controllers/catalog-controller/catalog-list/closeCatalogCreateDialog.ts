import {
  setCatalogCreateFormName,
  setCatalogCreateFormType,
  type SetState,
} from '../../../operations/catalog-operations';

export function closeCatalogCreateDialog(setState: SetState): void {
  setState({ type: 'SET_CREATE_DIALOG_OPEN', value: false });
  setCatalogCreateFormName(setState, '');
  setCatalogCreateFormType(setState, 'manual');
}

