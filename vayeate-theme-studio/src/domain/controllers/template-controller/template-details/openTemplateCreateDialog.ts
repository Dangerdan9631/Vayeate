import {
  setTemplateCreateFormName,
  type SetState,
} from '../../../operations/template-operations';

export function openTemplateCreateDialog(setState: SetState): void {
  setTemplateCreateFormName(setState, '');
  setState({ type: 'SET_TEMPLATE_CREATE_DIALOG_OPEN', value: true });
}

