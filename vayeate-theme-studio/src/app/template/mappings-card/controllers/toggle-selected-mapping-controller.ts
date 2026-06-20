import { singleton } from 'tsyringe';
import { ToggleTemplateMappingSelectionOperation } from '../../../../domain/operations/template-operations/mappings/toggle-template-mapping-selection-operation';
import { getCurrentTemplate, TemplatesStore } from '../../../../domain/state/data/templates-store';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import type { TemplateMappingId } from '../../../../model/template-mapping-assignment';

/** Toggles a real mapping in the active template selection. */
@singleton()
export class ToggleSelectedMappingController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly toggleSelection: ToggleTemplateMappingSelectionOperation,
  ) {}

  run(id: TemplateMappingId): void {
    const state = this.templateUiStore.getStore().state;
    const template = getCurrentTemplate(this.templatesStore.getStore().state.templates, state.selectedRef);
    if (!template) return;
    const exists = template.mappings.some(
      (mapping) => mapping.token.key === id.tokenKey && mapping.token.type === id.tokenType,
    );
    if (exists) this.toggleSelection.execute(id);
  }
}
