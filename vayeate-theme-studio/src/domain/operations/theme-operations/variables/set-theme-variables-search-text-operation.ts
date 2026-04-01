import { injectable } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { AppStateUpdate } from '../../../state/app-state';

/** Set search filter text for the theme variables list. */
@injectable()
export class SetThemeVariablesSearchTextOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(value: string): void {
    this.appStateSetter.apply({ type: 'SET_THEME_VARIABLES_SEARCH_TEXT', value });
  }
}

/** @deprecated Use SetThemeVariablesSearchTextOperation class instead. */
export function setThemeVariablesSearchText(setState: (update: AppStateUpdate) => void, value: string): void {
  setState({ type: 'SET_THEME_VARIABLES_SEARCH_TEXT', value });
}

