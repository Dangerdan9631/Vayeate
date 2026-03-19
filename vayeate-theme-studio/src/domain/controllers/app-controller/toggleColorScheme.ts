import type { UiStateUpdate } from '../../state/ui-state-reducer';
import { toggleColorScheme as toggleColorSchemeOp } from '../../operations/app-operations';

type SetUiState = (update: UiStateUpdate) => void;

/** Toggle the app color scheme preference (and update the UI state). */
export async function toggleColorScheme(setUiState: SetUiState, checked: boolean): Promise<void> {
  await toggleColorSchemeOp(setUiState, checked);
}

