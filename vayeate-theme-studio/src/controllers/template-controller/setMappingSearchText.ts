import { setTemplateMappingSearchText, type SetState } from '../../operations/template-operations';

export function setMappingSearchText(setState: SetState, value: string): void {
  setTemplateMappingSearchText(setState, value);
}
