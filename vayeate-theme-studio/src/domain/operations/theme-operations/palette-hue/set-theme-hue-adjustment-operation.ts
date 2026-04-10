import { singleton } from 'tsyringe';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';

@singleton()
export class SetThemeHueAdjustmentOperation {
  constructor(private readonly ThemesStateSetter: ThemesStateSetter) {}

  execute(value: number): void {
    this.ThemesStateSetter.apply({ type: 'SET_THEME_HUE_ADJUSTMENT', value });
  }
}
