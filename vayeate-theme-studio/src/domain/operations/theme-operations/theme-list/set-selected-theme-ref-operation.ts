import { singleton } from 'tsyringe';
import type { ThemeReference } from '../../../../model/schemas';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';

@singleton()
export class SetSelectedThemeRefOperation {
  constructor(private readonly ThemesStateSetter: ThemesStateSetter) {}

  execute(ref: ThemeReference | null): void {
    this.ThemesStateSetter.apply({ type: 'SET_SELECTED_THEME_REF', ref });
  }
}
