import type { UiStateUpdate } from '../../state/ui-state-reducer';
import { configService } from '../../../gateway/services/config-service';

type SetUiState = (update: UiStateUpdate) => void;

/** Toggle the active color scheme and persist the new preference to disk. */
export async function toggleColorScheme(setUiState: SetUiState, checked: boolean): Promise<void> {
  // action.checked = current state (true = dark), so toggle to the opposite
  const scheme: 'light' | 'dark' = checked ? 'light' : 'dark';

  setUiState({ type: 'SET_UI_COLOR_SCHEME', scheme });
  await configService.save({ colorScheme: scheme });
}

