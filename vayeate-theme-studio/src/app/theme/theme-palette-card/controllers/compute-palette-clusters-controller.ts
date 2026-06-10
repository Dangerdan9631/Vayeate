import { singleton } from 'tsyringe';
import { ComputePaletteClustersOperation } from '../../../../domain/operations/theme-operations/palette-cluster/compute-palette-clusters-operation';

/** Recompute palette k-means clusters off the main thread when inputs change. */
@singleton()
export class ComputePaletteClustersController {
  constructor(private readonly computePaletteClusters: ComputePaletteClustersOperation) {}

  async run(): Promise<void> {
    await this.computePaletteClusters.execute();
  }
}
