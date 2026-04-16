import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../state/template/templates-store';
import { AddContrastVariableOperation as AddContrastVariableOp } from '../../../operations/template-operations/variables-contrast/add-contrast-variable-operation';
import { BumpTemplateVersionForEditOperation } from '../../../operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { SaveTemplateOperation } from '../../../operations/template-operations/template-details/save-template-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations/template-list/refresh-template-refs-and-select-operation';

@singleton()
export class AddContrastVariableController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly addContrastVariableToTemplate: AddContrastVariableOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  async run(key: string, groupRef?: string | null): Promise<void> {
    const template = this.templatesStore.getStore().state.template;
    if (!template) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.addContrastVariableToTemplate.execute(base, key, groupRef);
    await this.saveTemplate.execute(next);
    await this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
  }
}
