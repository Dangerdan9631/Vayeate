import { singleton } from 'tsyringe';
import { SetPaletteSwatchGroupSelectionController } from './set-palette-swatch-group-selection-controller';

/** Add ref to selection (member swatch click). */
@singleton()
export class SetPaletteMemberSwatchController {
  constructor(private readonly setPaletteSwatchGroupSelection: SetPaletteSwatchGroupSelectionController) {}

  run(ref: string | undefined): void {
    if (ref == null) return;
    this.setPaletteSwatchGroupSelection.run([ref], true);
  }
}
