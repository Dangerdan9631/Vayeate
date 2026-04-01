import { singleton } from 'tsyringe';
import { SetThemePaneSelectionsOperation } from '../../../operations/theme-operations';

/** Set full pane selection (color and contrast refs) in one go. */
@singleton()
export class SetPaletteFullSelectionController {
  constructor(private readonly setThemePaneSelections: SetThemePaneSelectionsOperation) {}

  run(colorRefs: string[], contrastRefs: string[]): void {
    this.setThemePaneSelections.execute(colorRefs, contrastRefs);
  }
}
