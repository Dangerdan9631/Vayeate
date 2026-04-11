import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import {
  BumpTemplateVersionForEditOperation,
  SaveTemplateOperation,
  UpdateVariableGroupRefOperation as UpdateVariableGroupRefOp,
} from '../../../operations/template-operations';
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations';

@singleton()
export class UpdateVariableGroupRefController {
  constructor(
    private readonly templatesStateGetter: TemplatesStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly updateVariableGroupRefOp: UpdateVariableGroupRefOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  async run(variableKey: string, groupRef: string | null): Promise<void> {
    const template = this.templatesStateGetter.current().template;
    if (!template) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.updateVariableGroupRefOp.execute(base, variableKey, groupRef);
    await this.saveTemplate.execute(next);
    await this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
  }
}
