import { singleton } from 'tsyringe';
import { SetThemePreviewVariableFilterText } from '../../../operations/theme-operations';

@singleton()
export class SetPreviewVariableFilterTextController {
  constructor(private readonly setThemePreviewVariableFilterText: SetThemePreviewVariableFilterText) {}

  run(value: string): void {
    this.setThemePreviewVariableFilterText.execute(value);
  }
}
