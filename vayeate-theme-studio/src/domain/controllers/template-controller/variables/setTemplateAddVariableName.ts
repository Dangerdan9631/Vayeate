import { setTemplateAddVariableName as setTemplateAddVariableNameOp, type SetState } from '../../../operations/template-operations';

/** Store draft value for the "add variable" name input. */
export function setTemplateAddVariableName(setState: SetState, value: string): void {
  setTemplateAddVariableNameOp(setState, value);
}

