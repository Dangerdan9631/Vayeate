import type { SetState } from './types';

export function setTemplateCreateFormName(setState: SetState, value: string): void {
  setState({ type: 'SET_TEMPLATE_CREATE_FORM_NAME', value });
}
