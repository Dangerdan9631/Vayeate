import { singleton } from 'tsyringe';
import { SetThemePreviewVariableFilterClear } from '../../../operations/theme-operations';

@singleton()
export class ClearPreviewVariableFilterController {
  constructor(private readonly setThemePreviewVariableFilterClear: SetThemePreviewVariableFilterClear) {}

  run(): void {
    this.setThemePreviewVariableFilterClear.execute();
  }
}
