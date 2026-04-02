import { singleton } from 'tsyringe';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';
import type { ThemesStateUpdate } from '../../../state/theme/themes-state-reducer';

@singleton()
export class SetThemeCreateFormNameOperation {
  constructor(private readonly ThemesStateSetter: ThemesStateSetter) {}

  execute(value: string): void {
    this.ThemesStateSetter.apply({ type: 'SET_THEME_CREATE_FORM_NAME', value });
  }
}

/** @deprecated Use SetThemeCreateFormNameOperation class instead. */
export function setThemeCreateFormName(setState: (update: ThemesStateUpdate) => void, value: string): void {
  setState({ type: 'SET_THEME_CREATE_FORM_NAME', value });
}

