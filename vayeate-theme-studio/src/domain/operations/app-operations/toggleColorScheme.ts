import { singleton } from 'tsyringe';
import { UiStateSetter } from '../../state/ui-state-setter';
import { configService } from '../../../gateway/services/config-service';

@singleton()
export class ToggleColorScheme {
  constructor(private readonly uiStateSetter: UiStateSetter) {}

  async execute(checked: boolean): Promise<void> {
    // action.checked = current state (true = dark), so toggle to the opposite
    const scheme: 'light' | 'dark' = checked ? 'light' : 'dark';

    this.uiStateSetter.apply({ type: 'SET_UI_COLOR_SCHEME', scheme });
    await configService.save({ colorScheme: scheme });
  }
}
