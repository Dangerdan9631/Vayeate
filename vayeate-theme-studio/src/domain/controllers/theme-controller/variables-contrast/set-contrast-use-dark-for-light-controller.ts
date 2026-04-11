import { singleton } from 'tsyringe';
import type { ContrastVariableKey } from '../../../../model/schemas';
import type { Theme } from '../../../../model/schemas';
import {
  ApplyThemeStateAndSchedulePersistOperation,
  SetThemeOperation,
} from '../../../operations/theme-operations';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';

@singleton()
export class SetContrastUseDarkForLightController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setTheme: SetThemeOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
  ) {}

  run(ref: ContrastVariableKey | undefined, checked: boolean | undefined): void {
    const theme = this.themesStateGetter.current().theme;
    if (!theme || ref == null) return;
    const useDark = checked === true;
    const newAssignments = theme.contrastAssignments.map((a) =>
      a.contrastVariableRef === ref ? { ...a, useDarkForLight: useDark } : a,
    );
    const next: Theme = { ...theme, contrastAssignments: newAssignments };
    this.setTheme.execute(next);
    this.applyThemeStateAndSchedulePersist.execute(next);
  }
}
