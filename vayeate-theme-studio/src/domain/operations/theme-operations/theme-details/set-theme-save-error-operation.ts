import { singleton } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { AppStateUpdate } from '../../../state/app-state';

@singleton()
export class SetThemeSaveErrorOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(error: string | null): void {
    this.appStateSetter.apply({ type: 'SET_THEME_SAVE_ERROR', error });
  }
}

/** @deprecated Use SetThemeSaveErrorOperation class instead. */
export function setThemeSaveError(setState: (update: AppStateUpdate) => void, error: string | null): void {
  setState({ type: 'SET_THEME_SAVE_ERROR', error });
}

