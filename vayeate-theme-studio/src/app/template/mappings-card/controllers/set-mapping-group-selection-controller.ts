import { singleton } from 'tsyringe';
import { SetTemplateMappingSelectionBatchOperation } from '../../../../domain/operations/template-operations/mappings/set-template-mapping-selection-batch-operation';
import { getCurrentTemplate, TemplatesStore } from '../../../../domain/state/data/templates-store';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';

/** Sets selection for every mapping in one active template group. */
@singleton()
export class SetMappingGroupSelectionController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly setSelectionBatch: SetTemplateMappingSelectionBatchOperation,
  ) {}

  run(groupRef: string | null, checked: boolean): void {
    const state = this.templateUiStore.getStore().state;
    const template = getCurrentTemplate(this.templatesStore.getStore().state.templates, state.selectedRef);
    if (!template) return;

    const ids = template.mappings
      .filter((mapping) => (mapping.groupRef ?? null) === groupRef)
      .map((mapping) => ({
        tokenKey: mapping.token.key,
        tokenType: mapping.token.type,
      }));
    this.setSelectionBatch.execute(ids, checked);
  }
}
