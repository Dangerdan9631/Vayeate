import { singleton } from 'tsyringe';
import { SetThemeSaveErrorOperation } from '../../../operations/theme-operations/theme-details/set-theme-save-error-operation';

@singleton()
export class ClearThemeSaveErrorController {
  constructor(private readonly setThemeSaveError: SetThemeSaveErrorOperation) {}

  async run(): Promise<void> {
    this.setThemeSaveError.execute(null);
  }
}
