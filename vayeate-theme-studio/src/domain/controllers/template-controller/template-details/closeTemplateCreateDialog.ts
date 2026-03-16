import {
  setTemplateCreateFormName,
  type SetState,
} from '../../../operations/template-operations';

export function closeTemplateCreateDialog(setState: SetState): void {
  setState({ type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN', value: false });
  setTemplateCreateFormName(setState, '');
}

