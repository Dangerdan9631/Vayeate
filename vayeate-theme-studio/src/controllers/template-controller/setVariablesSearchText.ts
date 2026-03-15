import { setTemplateVariablesSearchText, type SetState } from '../../operations/template-operations';

export function setVariablesSearchText(setState: SetState, value: string): void {
  setTemplateVariablesSearchText(setState, value);
}
