import { singleton } from 'tsyringe';
import { SetThemePreviewVariableFilterTextOperation } from '../../../operations/theme-operations';

@singleton()
export class SetPreviewVariableFilterTextController {
  constructor(private readonly setThemePreviewVariableFilterText: SetThemePreviewVariableFilterTextOperation) {}

  run(value: string): void {
    this.setThemePreviewVariableFilterText.execute(value);
  }
}
