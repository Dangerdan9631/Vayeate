import { singleton } from 'tsyringe';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';

@singleton()
export class SetThemeCreateDialogOpenOperation {
  constructor(private readonly themesStateSetter: ThemesStateSetter) {}

  execute(value: boolean): void {
    this.themesStateSetter.apply({ type: 'SET_THEME_CREATE_DIALOG_OPEN', value });
  }
}
