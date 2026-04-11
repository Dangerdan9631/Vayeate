import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import { BumpTemplateVersionForEditOperation } from '../../../operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { RemoveColorVariableOperation as RemoveColorVariableOp } from '../../../operations/template-operations/variables-color/remove-color-variable-operation';
import { RemoveContrastVariableOperation as RemoveContrastVariableOp } from '../../../operations/template-operations/variables-contrast/remove-contrast-variable-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations/template-list/refresh-template-refs-and-select-operation';
import { SaveTemplateOperation } from '../../../operations/template-operations/template-details/save-template-operation';
import { referencedColorVarKeysFromTemplate } from '../../../utils/referenced-color-var-keys-from-template';
import { referencedContrastVarKeysFromTemplate } from '../../../utils/referenced-contrast-var-keys-from-template';

@singleton()
export class RemoveVariableController {
  constructor(
    private readonly templatesStateGetter: TemplatesStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly removeColorVariableFromTemplate: RemoveColorVariableOp,
    private readonly removeContrastVariableFromTemplate: RemoveContrastVariableOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  async run(key: string): Promise<void> {
    const template = this.templatesStateGetter.current().template;
    if (!template) return;

    if (template.colorVariables.some((variable) => variable.key === key)) {
      const refs = referencedColorVarKeysFromTemplate(template);
      if (refs.has(key)) return;
      const base = this.bumpTemplateVersionForEdit.execute(template);
      const next = this.removeColorVariableFromTemplate.execute(base, key);
      await this.saveTemplate.execute(next);
      await this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
      return;
    }

    const refs = referencedContrastVarKeysFromTemplate(template);
    if (refs.has(key)) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.removeContrastVariableFromTemplate.execute(base, key);
    await this.saveTemplate.execute(next);
    await this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
  }
}
