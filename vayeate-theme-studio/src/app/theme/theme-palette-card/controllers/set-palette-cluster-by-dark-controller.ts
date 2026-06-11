import { singleton } from 'tsyringe';
import { SetPaletteClusterByDarkOperation } from '../../../../domain/operations/theme-operations/palette-cluster/set-palette-cluster-by-dark-operation';

/**
 * Orchestrates set palette cluster by dark work for the theme UI.
 */
@singleton()
export class SetPaletteClusterByDarkController {
  constructor(private readonly setPaletteClusterByDark: SetPaletteClusterByDarkOperation) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @param checked Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
  run(checked: boolean): void {
    this.setPaletteClusterByDark.execute(checked);
  }
}
