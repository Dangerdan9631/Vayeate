import type { SetState } from '../types';

export function setTemplateVariablesSearchText(setState: SetState, value: string): void {
  setState({ type: 'SET_TEMPLATE_VARIABLES_SEARCH_TEXT', value });
}

