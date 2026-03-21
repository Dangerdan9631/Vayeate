import { singleton } from 'tsyringe';
import { SetTemplateVariablesSearchText } from '../../../operations/template-operations';

@singleton()
export class SetVariablesSearchTextController {
  constructor(private readonly setTemplateVariablesSearchText: SetTemplateVariablesSearchText) {}

  run(value: string): void {
    this.setTemplateVariablesSearchText.execute(value);
  }
}
