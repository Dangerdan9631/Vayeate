import { setAssignColorDraftText as setAssignColorDraftTextOp, type SetState } from '../../../operations/theme-operations';

export function setAssignColorDraftText(setState: SetState, value: string): void {
  setAssignColorDraftTextOp(setState, value);
}

