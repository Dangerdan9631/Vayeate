import { singleton } from 'tsyringe';
import { SetPaletteClusterByDarkOperation } from '../../../../domain/operations/theme-operations/palette-cluster/set-palette-cluster-by-dark-operation';

@singleton()
export class SetPaletteClusterByDarkController {
  constructor(private readonly setPaletteClusterByDark: SetPaletteClusterByDarkOperation) {}

  run(checked: boolean): void {
    this.setPaletteClusterByDark.execute(checked);
  }
}
