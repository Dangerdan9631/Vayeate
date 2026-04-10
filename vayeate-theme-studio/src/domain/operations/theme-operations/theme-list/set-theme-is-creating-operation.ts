import { singleton } from 'tsyringe';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';

@singleton()
export class SetThemeIsCreatingOperation {
  constructor(private readonly themesStateSetter: ThemesStateSetter) {}

  execute(value: boolean): void {
    this.themesStateSetter.apply({ type: 'SET_THEME_IS_CREATING', value });
  }
}
