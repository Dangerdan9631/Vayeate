import { singleton } from 'tsyringe';
import { SetThemePaneSelectionsOperation } from '../../../operations/theme-operations/pickers/set-theme-pane-selections-operation';

@singleton()
export class SetThemePaneSelectionsController {
  constructor(private readonly setThemePaneSelections: SetThemePaneSelectionsOperation) {}

  run(checkedColorRefs: string[], checkedContrastRefs: string[]): void {
    this.setThemePaneSelections.execute(checkedColorRefs, checkedContrastRefs);
  }
}
