import { singleton } from 'tsyringe';
import { ThemesStateSetter } from '../../../state/theme/themes-state-reducer';
import type { ThemesStateUpdate } from '../../../state/theme/themes-state-reducer';

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

/** @deprecated Use SetThemePaneSelectionsOperation class instead. */
export function setThemePaneSelections(
  setState: (update: ThemesStateUpdate) => void,
  checkedColorRefs: string[],
  checkedContrastRefs: string[],
): void {
  setState({
    type: 'SET_THEME_PANE_SELECTIONS',
    checkedColorRefs,
    checkedContrastRefs,
  });
}

