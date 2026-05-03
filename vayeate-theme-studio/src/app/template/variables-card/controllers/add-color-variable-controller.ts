import { singleton } from 'tsyringe';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { getCurrentTemplate, TemplatesStore } from '../../../../domain/state/data/templates-store';
import { AddColorVariableOperation as AddColorVariableOp } from '../../../../domain/operations/template-operations/variables-color/add-color-variable-operation';
import { BumpTemplateVersionForEditOperation } from '../../../../domain/operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { SaveTemplateOperation } from '../../../../domain/operations/template-operations/template-details/save-template-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../../../../domain/operations/template-operations/template-list/refresh-template-refs-and-select-operation';

@singleton()
export class AddColorVariableController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly templateUiStore: TemplateUiStore,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly addColorVariableToTemplate: AddColorVariableOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  run(key: string, groupRef?: string | null): void {
    const template = getCurrentTemplate(this.templatesStore.getStore().state.templates, this.templateUiStore.getStore().state.selectedRef);
    if (!template) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.addColorVariableToTemplate.execute(base, key, groupRef);
    this.saveTemplate.execute(next);
    this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
  }
}
