import { singleton } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { AppStateUpdate } from '../../../state/app-state';

@singleton()
export class SetThemeCreateFormNameOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(value: string): void {
    this.appStateSetter.apply({ type: 'SET_THEME_CREATE_FORM_NAME', value });
  }
}

/** @deprecated Use SetThemeCreateFormNameOperation class instead. */
export function setThemeCreateFormName(setState: (update: AppStateUpdate) => void, value: string): void {
  setState({ type: 'SET_THEME_CREATE_FORM_NAME', value });
}

