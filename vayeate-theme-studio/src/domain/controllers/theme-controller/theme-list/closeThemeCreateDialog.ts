import { singleton } from 'tsyringe';
import { SetThemeCreateFormName } from '../../../operations/theme-operations';
import { AppStateSetter } from '../../../state/app-state-setter';

@singleton()
export class CloseThemeCreateDialogController {
  constructor(
    private readonly setThemeCreateFormName: SetThemeCreateFormName,
    private readonly appStateSetter: AppStateSetter,
  ) {}

  run(): void {
    this.appStateSetter.apply({ type: 'SET_THEME_CREATE_DIALOG_OPEN', value: false });
    this.setThemeCreateFormName.execute('');
  }
}
