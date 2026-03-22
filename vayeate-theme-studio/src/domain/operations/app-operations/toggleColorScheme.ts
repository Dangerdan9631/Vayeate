import { singleton } from 'tsyringe';
import { UiStateSetter } from '../../state/ui-state-setter';
import { ConfigGateway } from '../../../gateway/config/config-gateway';

@singleton()
export class ToggleColorScheme {
  constructor(
    private readonly uiStateSetter: UiStateSetter,
    private readonly configGateway: ConfigGateway,
  ) {}

  async execute(checked: boolean): Promise<void> {
    // action.checked = current state (true = dark), so toggle to the opposite
    const scheme: 'light' | 'dark' = checked ? 'light' : 'dark';

    this.uiStateSetter.apply({ type: 'SET_UI_COLOR_SCHEME', scheme });
    await this.configGateway.save({ colorScheme: scheme });
  }
}
