import { singleton } from 'tsyringe';
import type { ThemeReference } from '../../../../model/schemas';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';
import type { ThemesStateUpdate } from '../../../state/theme/themes-state-reducer';

@singleton()
export class SetSelectedThemeRefOperation {
  constructor(private readonly ThemesStateSetter: ThemesStateSetter) {}

  execute(ref: ThemeReference | null): void {
    this.ThemesStateSetter.apply({ type: 'SET_SELECTED_THEME_REF', ref });
  }
}

/** @deprecated Use SetSelectedThemeRefOperation class instead. */
export function setSelectedThemeRef(setState: (update: ThemesStateUpdate) => void, ref: ThemeReference | null): void {
  setState({ type: 'SET_SELECTED_THEME_REF', ref });
}



