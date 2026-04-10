import { singleton } from 'tsyringe';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';

@singleton()
export class SetThemeCreateFormNameOperation {
  constructor(private readonly ThemesStateSetter: ThemesStateSetter) {}

  execute(value: string): void {
    this.ThemesStateSetter.apply({ type: 'SET_THEME_CREATE_FORM_NAME', value });
  }
}
