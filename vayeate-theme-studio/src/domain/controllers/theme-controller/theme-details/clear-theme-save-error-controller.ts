import { singleton } from 'tsyringe';
import { SetThemeSaveErrorOperation } from '../../../operations/theme-operations';

@singleton()
export class ClearThemeSaveErrorController {
  constructor(private readonly setThemeSaveError: SetThemeSaveErrorOperation) {}

  run(): void {
    this.setThemeSaveError.execute(null);
  }
}
