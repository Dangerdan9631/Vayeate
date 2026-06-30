import { singleton } from 'tsyringe';
import { ClearTemplateMappingSelectionOperation } from '../../../../domain/operations/template-operations/mappings/clear-template-mapping-selection-operation';

/** Clears the active template mapping selection. */
@singleton()
export class ClearSelectedMappingsController {
  constructor(private readonly clearSelection: ClearTemplateMappingSelectionOperation) {}

  run(): void {
    this.clearSelection.execute();
  }
}
