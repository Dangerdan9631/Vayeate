import { singleton } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { SetState } from '../types';

@singleton()
export class SetThemeSaveError {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(error: string | null): void {
    this.appStateSetter.apply({ type: 'SET_THEME_SAVE_ERROR', error });
  }
}

/** @deprecated Use SetThemeSaveError class instead. */
export function setThemeSaveError(setState: SetState, error: string | null): void {
  setState({ type: 'SET_THEME_SAVE_ERROR', error });
}

