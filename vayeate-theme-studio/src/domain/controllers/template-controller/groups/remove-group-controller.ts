import { singleton } from 'tsyringe';
import { AppStateGetter } from '../../../state/app-state-getter';
import {
  BumpTemplateVersionForEditOperation,
  RemoveGroupFromTemplateOperation,
  SaveTemplateOperation,
} from '../../../operations/template-operations';
import { groupNamesInUseFromTemplate } from '../../../utils/template-utils';
import { TemplateSharedFlows } from '../shared-flows';

@singleton()
export class RemoveGroupController {
  constructor(
    private readonly appStateGetter: AppStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly removeGroupFromTemplate: RemoveGroupFromTemplateOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly templateSharedFlows: TemplateSharedFlows,
  ) {}

  async run(groupId: string): Promise<void> {
    const template = this.appStateGetter.current().templates.template;
    if (!template) return;
    const inUse = groupNamesInUseFromTemplate(template);
    if (inUse.has(groupId)) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.removeGroupFromTemplate.execute(base, groupId);
    await this.saveTemplate.execute(next);
    await this.templateSharedFlows.refreshRefsAndSelect(next.name, next.version);
  }
}
