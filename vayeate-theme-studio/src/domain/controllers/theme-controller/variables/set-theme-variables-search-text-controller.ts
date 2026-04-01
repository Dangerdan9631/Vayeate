import { singleton } from 'tsyringe';
import { SetThemeVariablesSearchTextOperation } from '../../../operations/theme-operations';

@singleton()
export class SetThemeVariablesSearchTextController {
  constructor(private readonly setThemeVariablesSearchText: SetThemeVariablesSearchTextOperation) {}

  run(value: string): void {
    this.setThemeVariablesSearchText.execute(value);
  }
}
