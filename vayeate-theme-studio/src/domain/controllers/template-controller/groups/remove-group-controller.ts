import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import { BumpTemplateVersionForEditOperation } from '../../../operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { RemoveGroupFromTemplateOperation } from '../../../operations/template-operations/groups/remove-group-from-template-operation';
import { SaveTemplateOperation } from '../../../operations/template-operations/template-details/save-template-operation';
import { groupNamesInUseFromTemplate } from '../../../utils/template-utils';
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations/template-list/refresh-template-refs-and-select-operation';

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
