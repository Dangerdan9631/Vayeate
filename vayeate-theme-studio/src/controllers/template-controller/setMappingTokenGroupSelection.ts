import {
  setTemplateMappingTokenGroupSelection,
  type SetState,
} from '../../operations/template-operations';

export function setMappingTokenGroupSelection(setState: SetState, value: string): void {
  setTemplateMappingTokenGroupSelection(setState, value);
}
