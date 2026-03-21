import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { AppStateUpdate } from '../../../state/app-state';

@singleton()
export class SetTheme {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(theme: Theme | null, preserveHue?: boolean): void {
    this.appStateSetter.apply({ type: 'SET_THEME', theme, preserveHue });
  }
}

/** @deprecated Use SetTheme class instead. */
export function setTheme(
  setState: (update: AppStateUpdate) => void,
  theme: Theme | null,
  preserveHue?: boolean,
): void {
  setState({ type: 'SET_THEME', theme, preserveHue });
}



