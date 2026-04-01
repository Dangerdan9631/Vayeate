import { singleton } from 'tsyringe';
import { SetThemeCreateFormNameOperation } from '../../../operations/theme-operations';
import { AppStateSetter } from '../../../state/app-state-setter';

@singleton()
export class OpenThemeCreateDialogController {
  constructor(
    private readonly setThemeCreateFormName: SetThemeCreateFormNameOperation,
    private readonly appStateSetter: AppStateSetter,
  ) {}

  run(): void {
    this.setThemeCreateFormName.execute('');
    this.appStateSetter.apply({ type: 'SET_THEME_CREATE_DIALOG_OPEN', value: true });
  }
}
