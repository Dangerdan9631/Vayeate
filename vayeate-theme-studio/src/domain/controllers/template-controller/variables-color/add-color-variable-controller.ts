import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import {
  AddColorVariableOperation as AddColorVariableOp,
  BumpTemplateVersionForEditOperation,
  SaveTemplateOperation,
} from '../../../operations/template-operations';
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations';

@singleton()
export class AddColorVariableController {
  constructor(
    private readonly templatesStateGetter: TemplatesStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly addColorVariableToTemplate: AddColorVariableOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  async run(key: string, groupRef?: string | null): Promise<void> {
    const template = this.templatesStateGetter.current().template;
    if (!template) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.addColorVariableToTemplate.execute(base, key, groupRef);
    await this.saveTemplate.execute(next);
    await this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
  }
}
