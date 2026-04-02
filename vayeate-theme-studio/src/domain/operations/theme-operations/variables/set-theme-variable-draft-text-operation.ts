import { injectable } from 'tsyringe';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';
import type { ThemesStateUpdate } from '../../../state/theme/themes-state-reducer';

/** Store a draft text value for in-progress variable edits (for validation display). */
@injectable()
export class SetThemeVariableDraftTextOperation {
  constructor(private readonly ThemesStateSetter: ThemesStateSetter) {}

  execute(key: string, value: string): void {
    this.ThemesStateSetter.apply({ type: 'SET_THEME_VARIABLE_DRAFT_TEXT', key, value });
  }
}

/** @deprecated Use SetThemeVariableDraftTextOperation class instead. */
export function setThemeVariableDraftText(setState: (update: ThemesStateUpdate) => void, key: string, value: string): void {
  setState({ type: 'SET_THEME_VARIABLE_DRAFT_TEXT', key, value });
}

