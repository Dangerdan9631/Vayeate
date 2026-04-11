import { singleton } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/schemas';
import type { Theme } from '../../../../model/schemas';
import {
  ApplyThemeStateAndSchedulePersistOperation,
  SetThemeOperation,
} from '../../../operations/theme-operations';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';

@singleton()
export class SetColorUseDarkForLightController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setTheme: SetThemeOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
  ) {}

  run(ref: ColorVariableKey | undefined, checked: boolean | undefined): void {
    const theme = this.themesStateGetter.current().theme;
    if (!theme || ref == null) return;
    const useDark = checked === true;
    const newAssignments = theme.colorAssignments.map((a) =>
      a.colorRef === ref ? { ...a, useDarkForLight: useDark } : a,
    );
    const next: Theme = { ...theme, colorAssignments: newAssignments };
    this.setTheme.execute(next);
    this.applyThemeStateAndSchedulePersist.execute(next);
  }
}
