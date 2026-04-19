import { singleton } from 'tsyringe';
import { SetThemeSaveErrorOperation } from '../../../domain/operations/theme-operations/theme-details/set-theme-save-error-operation';

@singleton()
export class ClearThemeSaveErrorController {
  constructor(private readonly setThemeSaveError: SetThemeSaveErrorOperation) {}

  run(): void {
    this.setThemeSaveError.execute(null);
  }
}
