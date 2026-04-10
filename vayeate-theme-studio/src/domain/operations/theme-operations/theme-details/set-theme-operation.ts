import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';

@singleton()
export class SetThemeOperation {
  constructor(private readonly ThemesStateSetter: ThemesStateSetter) {}

  execute(theme: Theme | null, preserveHue?: boolean): void {
    this.ThemesStateSetter.apply({ type: 'SET_THEME', theme, preserveHue });
  }
}
