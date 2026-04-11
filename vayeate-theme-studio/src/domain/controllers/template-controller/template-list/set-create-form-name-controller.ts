import { singleton } from 'tsyringe';
import { SetTemplateCreateFormNameOperation } from '../../../operations/template-operations/template-list/set-template-create-form-name-operation';

@singleton()
export class SetCreateFormNameController {
  constructor(private readonly setTemplateCreateFormName: SetTemplateCreateFormNameOperation) {}

  async run(value: string): Promise<void> {
    this.setTemplateCreateFormName.execute(value);
  }
}
