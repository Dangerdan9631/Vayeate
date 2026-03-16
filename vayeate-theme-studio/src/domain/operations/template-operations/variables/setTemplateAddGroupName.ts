import type { SetState } from '../types';

/** Store draft value for the "add group" name input. */
export function setTemplateAddGroupName(setState: SetState, value: string): void {
  setState({ type: 'SET_TEMPLATE_ADD_GROUP_NAME', value });
}

