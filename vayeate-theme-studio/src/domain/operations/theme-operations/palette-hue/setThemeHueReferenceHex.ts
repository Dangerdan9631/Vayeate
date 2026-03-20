import { singleton } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { SetState } from '../types';

@singleton()
export class SetThemeHueReferenceHex {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(value: string): void {
    this.appStateSetter.apply({ type: 'SET_THEME_HUE_REFERENCE_HEX', value });
  }
}

/** @deprecated Use SetThemeHueReferenceHex class instead. */
export function setThemeHueReferenceHex(setState: SetState, value: string): void {
  setState({ type: 'SET_THEME_HUE_REFERENCE_HEX', value });
}

