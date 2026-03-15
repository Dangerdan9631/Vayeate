import type { SetState } from '../../operations/theme-operations';
import type { GetState } from '../../operations/undo-operations';
import { commitAssignColorText } from './commitAssignColorText';

/** Apply current assign-color draft text if valid (e.g. assign button click). */
export function applyAssignColorDraft(setState: SetState, getState: GetState): void {
  const draft = getState().themes.assignColorDraftText;
  if (!draft.trim()) return;
  commitAssignColorText(setState, getState, draft);
}
