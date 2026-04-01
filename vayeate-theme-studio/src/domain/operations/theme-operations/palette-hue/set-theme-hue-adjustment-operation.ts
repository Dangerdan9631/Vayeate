import { singleton } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { AppStateUpdate } from '../../../state/app-state';

@singleton()
export class SetThemeHueAdjustmentOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(value: number): void {
    this.appStateSetter.apply({ type: 'SET_THEME_HUE_ADJUSTMENT', value });
  }
}

/** @deprecated Use SetThemeHueAdjustmentOperation class instead. */
export function setThemeHueAdjustment(setState: (update: AppStateUpdate) => void, value: number): void {
  setState({ type: 'SET_THEME_HUE_ADJUSTMENT', value });
}

