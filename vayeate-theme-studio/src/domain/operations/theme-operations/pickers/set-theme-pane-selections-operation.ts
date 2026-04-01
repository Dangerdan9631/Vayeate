import { singleton } from 'tsyringe';
import { AppStateSetter } from '../../../state/app-state-setter';
import type { AppStateUpdate } from '../../../state/app-state';

@singleton()
export class SetThemePaneSelectionsOperation {
  constructor(private readonly appStateSetter: AppStateSetter) {}

  execute(checkedColorRefs: string[], checkedContrastRefs: string[]): void {
    this.appStateSetter.apply({
      type: 'SET_THEME_PANE_SELECTIONS',
      checkedColorRefs,
      checkedContrastRefs,
    });
  }
}

/** @deprecated Use SetThemePaneSelectionsOperation class instead. */
export function setThemePaneSelections(
  setState: (update: AppStateUpdate) => void,
  checkedColorRefs: string[],
  checkedContrastRefs: string[],
): void {
  setState({
    type: 'SET_THEME_PANE_SELECTIONS',
    checkedColorRefs,
    checkedContrastRefs,
  });
}

