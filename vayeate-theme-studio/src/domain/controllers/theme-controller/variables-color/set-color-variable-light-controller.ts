import { singleton } from 'tsyringe';
import type { ColorVariableKey } from '../../../../model/schemas';
import type { Theme } from '../../../../model/schemas';
import {
  ApplyThemeStateAndSchedulePersistOperation,
  SetThemeOperation,
} from '../../../operations/theme-operations';
import { ThemesStateGetter } from '../../../state/theme/themes-state-reducer';
import { normalizeHexSafe } from '../../../utils/color';

@singleton()
export class SetColorVariableLightController {
  constructor(
    private readonly themesStateGetter: ThemesStateGetter,
    private readonly setTheme: SetThemeOperation,
    private readonly applyThemeStateAndSchedulePersist: ApplyThemeStateAndSchedulePersistOperation,
  ) {}

  run(ref: ColorVariableKey | undefined, value: string): void {
    const theme = this.themesStateGetter.current().theme;
    if (!theme || !ref) return;
    const normalized = normalizeHexSafe(value);
    const newAssignments = theme.colorAssignments.map((a) =>
      a.colorRef === ref ? { ...a, light: normalized !== null ? { value: normalized } : null } : a,
    );
    const next: Theme = { ...theme, colorAssignments: newAssignments };
    this.setTheme.execute(next);
    this.applyThemeStateAndSchedulePersist.execute(next);
  }
}
