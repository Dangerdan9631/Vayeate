import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import {
  AddColorVariableOperation as AddColorVariableOp,
  AddContrastVariableOperation as AddContrastVariableOp,
  BumpTemplateVersionForEditOperation,
  RefreshTemplateRefsAndSelectOperation,
  SaveTemplateOperation,
  SetTemplateAddVariableNameOperation,
} from '../../../operations/template-operations';

@singleton()
export class AddVariableController {
  constructor(
    private readonly templatesStateGetter: TemplatesStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly addColorVariableToTemplate: AddColorVariableOp,
    private readonly addContrastVariableToTemplate: AddContrastVariableOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
    private readonly setTemplateAddVariableName: SetTemplateAddVariableNameOperation,
  ) {}

  async run(groupRef: string | null, variableKind: 'color' | 'contrast'): Promise<void> {
    const key = this.templatesStateGetter.current().addVariableName.trim();
    if (!key) return;
    const template = this.templatesStateGetter.current().template;
    if (!template) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    let next;
    if (variableKind === 'contrast') {
      next = this.addContrastVariableToTemplate.execute(base, key, groupRef);
    } else {
      next = this.addColorVariableToTemplate.execute(base, key, groupRef);
    }
    await this.saveTemplate.execute(next);
    await this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
    this.setTemplateAddVariableName.execute('');
  }
}
