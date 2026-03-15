import type { ContrastVariableKey } from '../../../model/schemas';
import type { SetState } from './types';

export function setTemplateMappingContrastVariableFilter(
  setState: SetState,
  values: ContrastVariableKey[],
): void {
  setState({ type: 'SET_TEMPLATE_MAPPING_CONTRAST_VARIABLE_FILTER', values });
}
