import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import {
  BumpTemplateVersionForEditOperation,
  RemoveGroupFromTemplateOperation,
  SaveTemplateOperation,
} from '../../../operations/template-operations';
import { groupNamesInUseFromTemplate } from '../../../utils/template-utils';
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations';

@singleton()
export class RemoveGroupController {
  constructor(
    private readonly templatesStateGetter: TemplatesStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly removeGroupFromTemplate: RemoveGroupFromTemplateOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  async run(groupId: string): Promise<void> {
    const template = this.templatesStateGetter.current().template;
    if (!template) return;
    const inUse = groupNamesInUseFromTemplate(template);
    if (inUse.has(groupId)) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.removeGroupFromTemplate.execute(base, groupId);
    await this.saveTemplate.execute(next);
    await this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
  }
}
