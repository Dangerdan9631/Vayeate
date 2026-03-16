import type { SetState } from '../types';

export function setTemplateMappingTokenGroupSelection(setState: SetState, value: string): void {
  setState({ type: 'SET_TEMPLATE_MAPPING_TOKEN_GROUP_SELECTION', value });
}

