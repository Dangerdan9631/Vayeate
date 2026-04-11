import { singleton } from 'tsyringe';
import { SetTemplateVariablesSearchTextOperation } from '../../../operations/template-operations/variables/set-template-variables-search-text-operation';

@singleton()
export class SetVariablesSearchTextController {
  constructor(private readonly setTemplateVariablesSearchText: SetTemplateVariablesSearchTextOperation) {}

  async run(value: string): Promise<void> {
    this.setTemplateVariablesSearchText.execute(value);
  }
}
