import { singleton } from 'tsyringe';
import { SetThemePreviewVariableFilterClearOperation } from '../../../operations/theme-operations';

@singleton()
export class ClearPreviewVariableFilterController {
  constructor(private readonly setThemePreviewVariableFilterClear: SetThemePreviewVariableFilterClearOperation) {}

  run(): void {
    this.setThemePreviewVariableFilterClear.execute();
  }
}
