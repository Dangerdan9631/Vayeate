import { singleton } from 'tsyringe';
import { SetThemeCreateFormNameOperation } from '../../../operations/theme-operations';

@singleton()
export class SetThemeCreateFormNameController {
  constructor(private readonly setThemeCreateFormName: SetThemeCreateFormNameOperation) {}

  run(value: string): void {
    this.setThemeCreateFormName.execute(value);
  }
}
