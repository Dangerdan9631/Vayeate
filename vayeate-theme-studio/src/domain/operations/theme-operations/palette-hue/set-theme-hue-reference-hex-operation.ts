import { singleton } from 'tsyringe';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';

@singleton()
export class SetThemeHueReferenceHexOperation {
  constructor(private readonly ThemesStateSetter: ThemesStateSetter) {}

  execute(value: string): void {
    this.ThemesStateSetter.apply({ type: 'SET_THEME_HUE_REFERENCE_HEX', value });
  }
}
