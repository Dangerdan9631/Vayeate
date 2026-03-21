import { singleton } from 'tsyringe';
import { SetPaletteSwatchGroupSelectionController } from './setPaletteSwatchGroupSelection';

/** Add ref to selection (member swatch click). */
@singleton()
export class SetPaletteMemberSwatchController {
  constructor(private readonly setPaletteSwatchGroupSelection: SetPaletteSwatchGroupSelectionController) {}

  run(ref: string | undefined): void {
    if (ref == null) return;
    this.setPaletteSwatchGroupSelection.run([ref], true);
  }
}
