import type { ContrastVariableKey } from '../../model/schemas';
import {
  setTemplateMappingContrastVariableFilter,
  type SetState,
} from '../../operations/template-operations';

export function setMappingContrastVariableFilter(
  setState: SetState,
  values: ContrastVariableKey[],
): void {
  setTemplateMappingContrastVariableFilter(setState, values);
}
