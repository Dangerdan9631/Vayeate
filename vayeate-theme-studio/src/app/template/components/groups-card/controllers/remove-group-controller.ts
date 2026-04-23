import { singleton } from 'tsyringe';
import { TemplatesStore } from '../../../../../domain/state/template/templates-store';
import { BumpTemplateVersionForEditOperation } from '../../../../../domain/operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { RemoveGroupFromTemplateOperation } from '../../../../../domain/operations/template-operations/groups/remove-group-from-template-operation';
import { SaveTemplateOperation } from '../../../../../domain/operations/template-operations/template-details/save-template-operation';
import { groupNamesInUseFromTemplate } from '../../../../../domain/utils/group-names-in-use-from-template';
import { RefreshTemplateRefsAndSelectOperation } from '../../../../../domain/operations/template-operations/template-list/refresh-template-refs-and-select-operation';

@singleton()
export class RemoveGroupController {
  constructor(
    private readonly templatesStore: TemplatesStore,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly removeGroupFromTemplate: RemoveGroupFromTemplateOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
  ) {}

  run(groupId: string): void {
    const template = this.templatesStore.getStore().state.template;
    if (!template) return;
    const inUse = groupNamesInUseFromTemplate(template);
    if (inUse.has(groupId)) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.removeGroupFromTemplate.execute(base, groupId);
    this.saveTemplate.execute(next);
    this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
  }
}
