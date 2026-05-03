import { singleton } from 'tsyringe';
import { getCurrentTemplate, TemplatesStore } from '../../../../domain/state/template/templates-store';
import { BumpTemplateVersionForEditOperation } from '../../../../domain/operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { RemoveColorVariableOperation as RemoveColorVariableOp } from '../../../../domain/operations/template-operations/variables-color/remove-color-variable-operation';
import { RemoveContrastVariableOperation as RemoveContrastVariableOp } from '../../../../domain/operations/template-operations/variables-contrast/remove-contrast-variable-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../../../../domain/operations/template-operations/template-list/refresh-template-refs-and-select-operation';
import { SaveTemplateOperation } from '../../../../domain/operations/template-operations/template-details/save-template-operation';
import { ValidateCanRemoveVariable } from '../../../../domain/validations/template-validations/validate-can-remove-variable';

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

  run(key: string): void {
    const template = getCurrentTemplate(this.templatesStore.getStore());
    if (!template || !this.validateCanRemove.test(template, key)) return;

    if (template.colorVariables.some((variable) => variable.key === key)) {
      const base = this.bumpTemplateVersionForEdit.execute(template);
      const next = this.removeColorVariableFromTemplate.execute(base, key);
      this.saveTemplate.execute(next);
      this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
      return;
    }

    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.removeContrastVariableFromTemplate.execute(base, key);
    this.saveTemplate.execute(next);
    this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
  }
}
