import { singleton } from 'tsyringe';
import { SetThemeVariablesSearchTextOperation } from '../../../../domain/operations/theme-operations/variables/set-theme-variables-search-text-operation';

@singleton()
export class SetThemeVariablesSearchTextController {
  constructor(private readonly setThemeVariablesSearchText: SetThemeVariablesSearchTextOperation) {}

  run(value: string): void {
    this.setThemeVariablesSearchText.execute(value);
  }
}
