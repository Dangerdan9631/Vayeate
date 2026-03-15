import type { SetState } from './types';

/** Store draft value for the "add variable" name input. */
export function setTemplateAddVariableName(setState: SetState, value: string): void {
  setState({ type: 'SET_TEMPLATE_ADD_VARIABLE_NAME', value });
}
