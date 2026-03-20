import { singleton } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { SetState } from '../types';

@singleton()
export class SetThemeCreateFormName {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(value: string): void {
    this.appStateSetter.apply({ type: 'SET_THEME_CREATE_FORM_NAME', value });
  }
}

/** @deprecated Use SetThemeCreateFormName class instead. */
export function setThemeCreateFormName(setState: SetState, value: string): void {
  setState({ type: 'SET_THEME_CREATE_FORM_NAME', value });
}

