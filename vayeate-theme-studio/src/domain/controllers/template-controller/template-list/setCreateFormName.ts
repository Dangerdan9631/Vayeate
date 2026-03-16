import { setTemplateCreateFormName, type SetState } from '../../../operations/template-operations';

export function setCreateFormName(setState: SetState, value: string): void {
  setTemplateCreateFormName(setState, value);
}

