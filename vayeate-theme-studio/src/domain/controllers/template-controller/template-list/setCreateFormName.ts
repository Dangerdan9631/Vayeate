import { singleton } from 'tsyringe';
import { SetTemplateCreateFormName } from '../../../operations/template-operations';

@singleton()
export class SetCreateFormNameController {
  constructor(private readonly setTemplateCreateFormName: SetTemplateCreateFormName) {}

  run(value: string): void {
    this.setTemplateCreateFormName.execute(value);
  }
}
