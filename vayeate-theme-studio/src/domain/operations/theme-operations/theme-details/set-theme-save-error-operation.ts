import { singleton } from 'tsyringe';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';

@singleton()
export class SetThemeSaveErrorOperation {
  constructor(private readonly ThemesStateSetter: ThemesStateSetter) {}

  execute(error: string | null): void {
    this.ThemesStateSetter.apply({ type: 'SET_THEME_SAVE_ERROR', error });
  }
}
