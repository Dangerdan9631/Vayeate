import { singleton } from 'tsyringe';
import { SetClusterCountPreviewOperation } from '../../../../domain/operations/theme-operations/palette-cluster/set-cluster-count-preview-operation';

/** Update cluster count preview in UI state only (slider drag; no persist). */
@singleton()
export class SetPaletteClusterCountKPreviewController {
  constructor(private readonly setClusterCountPreview: SetClusterCountPreviewOperation) {}

  run(value: number): void {
    this.setClusterCountPreview.execute(value);
  }
}
