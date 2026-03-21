import { singleton } from 'tsyringe';
import { SetThemeSaveError } from '../../../operations/theme-operations';

@singleton()
export class ClearThemeSaveErrorController {
  constructor(private readonly setThemeSaveError: SetThemeSaveError) {}

  run(): void {
    this.setThemeSaveError.execute(null);
  }
}
