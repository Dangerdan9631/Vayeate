import { singleton } from 'tsyringe';
import { SetTemplateAddGroupName } from '../../../operations/template-operations';

/** Store draft value for the "add group" name input. */
@singleton()
export class SetTemplateAddGroupNameController {
  constructor(private readonly setTemplateAddGroupName: SetTemplateAddGroupName) {}

  run(value: string): void {
    this.setTemplateAddGroupName.execute(value);
  }
}
