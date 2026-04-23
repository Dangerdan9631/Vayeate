import { singleton } from 'tsyringe';
import { SetTemplateVariablesSearchTextOperation } from '../../../../../domain/operations/template-operations/variables/set-template-variables-search-text-operation';

@singleton()
export class SetVariablesSearchTextController {
  constructor(private readonly setTemplateVariablesSearchText: SetTemplateVariablesSearchTextOperation) {}

  run(value: string): void {
    this.setTemplateVariablesSearchText.execute(value);
  }
}
