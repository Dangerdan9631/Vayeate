import type { ColorVariableKey } from '../../model/schemas';
import {
  setTemplateMappingColorVariableFilter,
  type SetState,
} from '../../operations/template-operations';

export function setMappingColorVariableFilter(
  setState: SetState,
  values: ColorVariableKey[],
): void {
  setTemplateMappingColorVariableFilter(setState, values);
}
