import { singleton } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { AppStateUpdate } from '../../../state/app-state';

@singleton()
export class SetThemeHueReferenceHexOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(value: string): void {
    this.appStateSetter.apply({ type: 'SET_THEME_HUE_REFERENCE_HEX', value });
  }
}

/** @deprecated Use SetThemeHueReferenceHexOperation class instead. */
export function setThemeHueReferenceHex(setState: (update: AppStateUpdate) => void, value: string): void {
  setState({ type: 'SET_THEME_HUE_REFERENCE_HEX', value });
}

