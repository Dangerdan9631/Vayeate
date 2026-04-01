import { singleton } from 'tsyringe';
import { SetTemplateVariablesSearchTextOperation } from '../../../operations/template-operations';

@singleton()
export class SetVariablesSearchTextController {
  constructor(private readonly setTemplateVariablesSearchText: SetTemplateVariablesSearchTextOperation) {}

  run(value: string): void {
    this.setTemplateVariablesSearchText.execute(value);
  }
}
