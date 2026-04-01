import { singleton } from 'tsyringe';
import { SetTemplateCreateFormNameOperation } from '../../../operations/template-operations';

@singleton()
export class SetCreateFormNameController {
  constructor(private readonly setTemplateCreateFormName: SetTemplateCreateFormNameOperation) {}

  run(value: string): void {
    this.setTemplateCreateFormName.execute(value);
  }
}
