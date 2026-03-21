import { singleton } from 'tsyringe';
import { AddGroupController } from './addGroup';
import { SetTemplateAddGroupNameController } from './setTemplateAddGroupName';

@singleton()
export class AddGroupAndClearInputController {
  constructor(
    private readonly addGroup: AddGroupController,
    private readonly setTemplateAddGroupName: SetTemplateAddGroupNameController,
  ) {}

  async run(name: string): Promise<void> {
    await this.addGroup.run(name);
    this.setTemplateAddGroupName.run('');
  }
}
