import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import {
  AddColorVariableOperation as AddColorVariableOp,
  BumpTemplateVersionForEditOperation,
  SaveTemplateOperation,
} from '../../../operations/template-operations';
import { TemplateSharedFlows } from '../shared-flows';

@singleton()
export class AddColorVariableController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly addColorVariableToTemplate: AddColorVariableOp,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly templateSharedFlows: TemplateSharedFlows,
  ) {}

  async run(key: string, groupRef?: string | null): Promise<void> {
    const template = this.appStateGetter.current().templates.template;
    if (!template) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.addColorVariableToTemplate.execute(base, key, groupRef);
    await this.saveTemplate.execute(next);
    await this.templateSharedFlows.refreshRefsAndSelect(next.name, next.version);
  }
}
