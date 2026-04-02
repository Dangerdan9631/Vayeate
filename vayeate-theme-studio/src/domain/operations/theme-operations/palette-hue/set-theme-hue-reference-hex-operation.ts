import { singleton } from 'tsyringe';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';
import type { ThemesStateUpdate } from '../../../state/theme/themes-state-reducer';

@singleton()
export class SetThemeHueReferenceHexOperation {
  constructor(private readonly ThemesStateSetter: ThemesStateSetter) {}

  execute(value: string): void {
    this.ThemesStateSetter.apply({ type: 'SET_THEME_HUE_REFERENCE_HEX', value });
  }
}

/** @deprecated Use SetThemeHueReferenceHexOperation class instead. */
export function setThemeHueReferenceHex(setState: (update: ThemesStateUpdate) => void, value: string): void {
  setState({ type: 'SET_THEME_HUE_REFERENCE_HEX', value });
}

