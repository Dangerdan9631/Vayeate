import { injectable } from 'tsyringe';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';
import type { ThemesStateUpdate } from '../../../state/theme/themes-state-reducer';

/** Set search filter text for the theme variables list. */
@injectable()
export class SetThemeVariablesSearchTextOperation {
  constructor(private readonly ThemesStateSetter: ThemesStateSetter) {}

  execute(value: string): void {
    this.ThemesStateSetter.apply({ type: 'SET_THEME_VARIABLES_SEARCH_TEXT', value });
  }
}

/** @deprecated Use SetThemeVariablesSearchTextOperation class instead. */
export function setThemeVariablesSearchText(setState: (update: ThemesStateUpdate) => void, value: string): void {
  setState({ type: 'SET_THEME_VARIABLES_SEARCH_TEXT', value });
}

