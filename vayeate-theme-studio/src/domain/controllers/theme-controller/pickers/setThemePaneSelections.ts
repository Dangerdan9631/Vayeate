import { singleton } from 'tsyringe';
import { SetThemePaneSelections } from '../../../operations/theme-operations';

@singleton()
export class SetThemePaneSelectionsController {
  constructor(private readonly setThemePaneSelections: SetThemePaneSelections) {}

  run(checkedColorRefs: string[], checkedContrastRefs: string[]): void {
    this.setThemePaneSelections.execute(checkedColorRefs, checkedContrastRefs);
  }
}
