import { singleton } from 'tsyringe';
import { SetThemeVariablesSearchText } from '../../../operations/theme-operations';

@singleton()
export class SetThemeVariablesSearchTextController {
  constructor(private readonly setThemeVariablesSearchText: SetThemeVariablesSearchText) {}

  run(value: string): void {
    this.setThemeVariablesSearchText.execute(value);
  }
}
