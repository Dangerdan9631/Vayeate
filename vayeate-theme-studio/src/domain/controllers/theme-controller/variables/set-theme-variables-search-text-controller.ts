import { singleton } from 'tsyringe';
import { SetThemeVariablesSearchTextOperation } from '../../../operations/theme-operations/variables/set-theme-variables-search-text-operation';

@singleton()
export class SetThemeVariablesSearchTextController {
  constructor(private readonly setThemeVariablesSearchText: SetThemeVariablesSearchTextOperation) {}

  async run(value: string): Promise<void> {
    this.setThemeVariablesSearchText.execute(value);
  }
}
