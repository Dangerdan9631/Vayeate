import type { SetState } from '../types';

export function setTemplateMappingSearchText(setState: SetState, value: string): void {
  setState({ type: 'SET_TEMPLATE_MAPPING_SEARCH_TEXT', value });
}

