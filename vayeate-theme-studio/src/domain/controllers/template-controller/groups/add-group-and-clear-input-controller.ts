import { singleton } from 'tsyringe';
import { AddGroupController } from './add-group-controller';
import { SetTemplateAddGroupNameController } from './set-template-add-group-name-controller';

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
