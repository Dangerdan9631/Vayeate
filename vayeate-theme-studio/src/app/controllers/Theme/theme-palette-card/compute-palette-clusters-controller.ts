import { singleton } from 'tsyringe';
import { ComputePaletteClustersOperation } from '../../../../domain/operations/Theme/theme-operations/palette-cluster/compute-palette-clusters-operation';

/**
 * Recompute palette k-means clusters off the main thread when inputs change.
 */
/**
 * Orchestrates compute palette clusters work for the theme UI.
 */
@singleton()
export class ComputePaletteClustersController {
  constructor(private readonly computePaletteClusters: ComputePaletteClustersOperation) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @returns Nothing; the operation schedules its worker-backed compute work.
   */
  run(): void {
    this.computePaletteClusters.execute();
  }
}
