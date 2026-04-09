import { singleton } from 'tsyringe';
import { TemplatesStateGetter } from '../../../state/template/templates-state-reducer';
import { AddGroupController } from './add-group-controller';
import { SetTemplateAddGroupNameController } from './set-template-add-group-name-controller';

@singleton()
export class AddGroupAndClearInputController {
  constructor(
    private readonly templatesStateGetter: TemplatesStateGetter,
    private readonly addGroup: AddGroupController,
    private readonly setTemplateAddGroupName: SetTemplateAddGroupNameController,
  ) {}

  async run(): Promise<void> {
    const name = this.templatesStateGetter.current().addGroupName.trim();
    if (!name) return;
    await this.addGroup.run(name);
    this.setTemplateAddGroupName.run('');
  }
}
