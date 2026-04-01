import { singleton } from 'tsyringe';
import { SetThemePaneSelectionsOperation } from '../../../operations/theme-operations';

@singleton()
export class SetThemePaneSelectionsController {
  constructor(private readonly setThemePaneSelections: SetThemePaneSelectionsOperation) {}

  run(checkedColorRefs: string[], checkedContrastRefs: string[]): void {
    this.setThemePaneSelections.execute(checkedColorRefs, checkedContrastRefs);
  }
}
