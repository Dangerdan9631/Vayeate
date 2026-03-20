import { singleton } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { SetState } from '../types';

@singleton()
export class SetThemeHueAdjustment {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(value: number): void {
    this.appStateSetter.apply({ type: 'SET_THEME_HUE_ADJUSTMENT', value });
  }
}

/** @deprecated Use SetThemeHueAdjustment class instead. */
export function setThemeHueAdjustment(setState: SetState, value: number): void {
  setState({ type: 'SET_THEME_HUE_ADJUSTMENT', value });
}

