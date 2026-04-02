import { singleton } from 'tsyringe';
import { SetThemeCreateFormNameOperation } from '../../../operations/theme-operations';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';

@singleton()
export class CloseThemeCreateDialogController {
  constructor(
    private readonly setThemeCreateFormName: SetThemeCreateFormNameOperation,
    private readonly themesStateSetter: ThemesStateSetter,
  ) {}

  run(): void {
    this.themesStateSetter.apply({ type: 'SET_THEME_CREATE_DIALOG_OPEN', value: false });
    this.setThemeCreateFormName.execute('');
  }
}
