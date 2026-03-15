import {
  setCatalogCreateFormName,
  setCatalogCreateFormType,
  type SetState,
} from '../../operations/catalog-operations';

export function openCatalogCreateDialog(setState: SetState): void {
  setCatalogCreateFormName(setState, '');
  setCatalogCreateFormType(setState, 'manual');
  setState({ type: 'SET_CREATE_DIALOG_OPEN', value: true });
}
