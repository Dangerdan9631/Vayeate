import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import {
  BumpTemplateVersionForEditOperation,
  RemoveColorVariableOperation as RemoveColorVariableOp,
  RemoveContrastVariableOperation as RemoveContrastVariableOp,
  RefreshTemplateRefsAndSelectOperation,
  SaveTemplateOperation,
} from '../../../operations/template-operations';
import {
  referencedColorVarKeysFromTemplate,
  referencedContrastVarKeysFromTemplate,
} from '../../../utils/template-utils';

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
