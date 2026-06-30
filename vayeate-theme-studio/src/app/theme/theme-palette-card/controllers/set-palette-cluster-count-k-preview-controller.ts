import { singleton } from 'tsyringe';
import { SetClusterCountPreviewOperation } from '../../../../domain/operations/theme-operations/palette-cluster/set-cluster-count-preview-operation';

/**
 * Update cluster count preview in UI state only (slider drag; no persist).
 */
/**
 * Orchestrates set palette cluster count kpreview work for the theme UI.
 */
@singleton()
export class SetPaletteClusterCountKPreviewController {
  constructor(private readonly setClusterCountPreview: SetClusterCountPreviewOperation) {}

  /**
 * Validates input and invokes the domain operations for this interaction.
 * @param value Input for this call.
 * @returns Promise resolved when orchestration completes.
   */
  run(value: number): void {
    this.setClusterCountPreview.execute(value);
  }
}
