import { singleton } from 'tsyringe';
import { SetTemplateAddGroupNameOperation } from '../../../operations/template-operations/variables/set-template-add-group-name-operation';

/** Store draft value for the "add group" name input. */
@singleton()
export class SetTemplateAddGroupNameController {
  constructor(private readonly setTemplateAddGroupName: SetTemplateAddGroupNameOperation) {}

  async run(value: string): Promise<void> {
    this.setTemplateAddGroupName.execute(value);
  }
}
