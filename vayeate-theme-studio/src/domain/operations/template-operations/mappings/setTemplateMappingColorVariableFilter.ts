import type { ColorVariableKey } from '../../../../model/schemas';
import type { SetState } from '../types';

export function setTemplateMappingColorVariableFilter(
  setState: SetState,
  values: ColorVariableKey[],
): void {
  setState({ type: 'SET_TEMPLATE_MAPPING_COLOR_VARIABLE_FILTER', values });
}



