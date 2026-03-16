import type { SetState } from '../types';

/** Set draft text for the palette assign-color input (session only). */
export function setAssignColorDraftText(setState: SetState, value: string): void {
  setState({ type: 'SET_ASSIGN_COLOR_DRAFT_TEXT', value });
}

