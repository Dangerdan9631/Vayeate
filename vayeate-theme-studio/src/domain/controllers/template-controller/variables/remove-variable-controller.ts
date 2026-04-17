import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../state/template/templates-store';
import { BumpTemplateVersionForEditOperation } from '../../../operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { RemoveColorVariableOperation as RemoveColorVariableOp } from '../../../operations/template-operations/variables-color/remove-color-variable-operation';
import { RemoveContrastVariableOperation as RemoveContrastVariableOp } from '../../../operations/template-operations/variables-contrast/remove-contrast-variable-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations/template-list/refresh-template-refs-and-select-operation';
import { SaveTemplateOperation } from '../../../operations/template-operations/template-details/save-template-operation';
import { ValidateCanRemoveVariable } from '../../../validations/template-validations/validate-can-remove-variable';

@singleton()
export class RemoveVariableController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly validateCanRemove: ValidateCanRemoveVariable,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly removeColorVariableFromTemplate: RemoveColorVariableOp,
    private readonly removeContrastVariableFromTemplate: RemoveContrastVariableOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  async run(key: string): Promise<void> {
    const template = this.templatesStore.getStore().state.template;
    if (!template || !this.validateCanRemove.test(template, key)) return;

    if (template.colorVariables.some((variable) => variable.key === key)) {
      const base = this.bumpTemplateVersionForEdit.execute(template);
      const next = this.removeColorVariableFromTemplate.execute(base, key);
      await this.saveTemplate.execute(next);
      await this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
      return;
    }

    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.removeContrastVariableFromTemplate.execute(base, key);
    await this.saveTemplate.execute(next);
    await this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
  }
}
