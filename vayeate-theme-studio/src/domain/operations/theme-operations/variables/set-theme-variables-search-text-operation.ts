import { singleton } from 'tsyringe';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';

/** Set search filter text for the theme variables list. */
@singleton()
export class SetThemeVariablesSearchTextOperation {
  constructor(private readonly ThemesStateSetter: ThemesStateSetter) {}

  execute(value: string): void {
    this.ThemesStateSetter.apply({ type: 'SET_THEME_VARIABLES_SEARCH_TEXT', value });
  }
}
