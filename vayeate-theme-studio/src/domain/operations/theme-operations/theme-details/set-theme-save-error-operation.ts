import { singleton } from 'tsyringe';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';
import type { ThemesStateUpdate } from '../../../state/theme/themes-state-reducer';

@singleton()
export class SetThemeSaveErrorOperation {
  constructor(private readonly ThemesStateSetter: ThemesStateSetter) {}

  execute(error: string | null): void {
    this.ThemesStateSetter.apply({ type: 'SET_THEME_SAVE_ERROR', error });
  }
}

/** @deprecated Use SetThemeSaveErrorOperation class instead. */
export function setThemeSaveError(setState: (update: ThemesStateUpdate) => void, error: string | null): void {
  setState({ type: 'SET_THEME_SAVE_ERROR', error });
}

