import { singleton } from 'tsyringe';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';

@singleton()
export class SetThemePaneSelectionsOperation {
  constructor(private readonly ThemesStateSetter: ThemesStateSetter) {}

  execute(checkedColorRefs: string[], checkedContrastRefs: string[]): void {
    this.ThemesStateSetter.apply({
      type: 'SET_THEME_PANE_SELECTIONS',
      checkedColorRefs,
      checkedContrastRefs,
    });
  }
}
