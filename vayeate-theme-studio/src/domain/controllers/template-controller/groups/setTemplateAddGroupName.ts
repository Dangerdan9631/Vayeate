import { setTemplateAddGroupName as setTemplateAddGroupNameOp, type SetState } from '../../../operations/template-operations';

/** Store draft value for the "add group" name input. */
export function setTemplateAddGroupName(setState: SetState, value: string): void {
  setTemplateAddGroupNameOp(setState, value);
}

