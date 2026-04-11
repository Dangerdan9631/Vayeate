import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import { AddGroupToTemplateOperation } from '../../../operations/template-operations/groups/add-group-to-template-operation';
import { BumpTemplateVersionForEditOperation } from '../../../operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { RefreshTemplateRefsAndSelectOperation } from '../../../operations/template-operations/template-list/refresh-template-refs-and-select-operation';
import { SaveTemplateOperation } from '../../../operations/template-operations/template-details/save-template-operation';
import { SetTemplateAddGroupNameOperation } from '../../../operations/template-operations/variables/set-template-add-group-name-operation';

@singleton()
export class AddGroupAndClearInputController {
  constructor(
    private readonly templatesStateGetter: TemplatesStateGetter,
    private readonly bumpTemplateVersionForEdit: BumpTemplateVersionForEditOperation,
    private readonly addGroupToTemplate: AddGroupToTemplateOperation,
    private readonly saveTemplate: SaveTemplateOperation,
    private readonly refreshTemplateRefsAndSelect: RefreshTemplateRefsAndSelectOperation,
    private readonly setTemplateAddGroupName: SetTemplateAddGroupNameOperation,
  ) {}

  async run(): Promise<void> {
    const name = this.templatesStateGetter.current().addGroupName.trim();
    if (!name) return;
    const template = this.templatesStateGetter.current().template;
    if (!template) return;
    const base = this.bumpTemplateVersionForEdit.execute(template);
    const next = this.addGroupToTemplate.execute(base, name);
    if (!next) return;
    await this.saveTemplate.execute(next);
    await this.refreshTemplateRefsAndSelect.execute(next.name, next.version);
    this.setTemplateAddGroupName.execute('');
  }
}
