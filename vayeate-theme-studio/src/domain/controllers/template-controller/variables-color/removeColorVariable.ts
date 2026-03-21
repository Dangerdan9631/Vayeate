import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import {
  BumpTemplateVersionForEdit,
  RemoveColorVariable as RemoveColorVariableOp,
  SaveTemplate,
} from '../../../operations/template-operations';
import { referencedColorVarKeysFromTemplate } from '../../../utils/template-utils';
import { TemplateSharedFlows } from '../shared-flows';

@singleton()
export class RemoveColorVariableController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEdit,
    private readonly removeColorVariableFromTemplate: RemoveColorVariableOp,
    private readonly saveTemplate: SaveTemplate,
    private readonly templateSharedFlows: TemplateSharedFlows,
  ) {}

  async run(key: string): Promise<void> {
    const template = this.appStateGetter.current().templates.template;
    if (!template) return;
    const refs = referencedColorVarKeysFromTemplate(template);
    if (refs.has(key)) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.removeColorVariableFromTemplate.execute(base, key);
    await this.saveTemplate.execute(next);
    await this.templateSharedFlows.refreshRefsAndSelect(next.name, next.version);
  }
}
