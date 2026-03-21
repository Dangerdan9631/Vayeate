import { singleton } from 'tsyringe';
import { SetThemeCreateFormName } from '../../../operations/theme-operations';

@singleton()
export class SetThemeCreateFormNameController {
  constructor(private readonly setThemeCreateFormName: SetThemeCreateFormName) {}

  run(value: string): void {
    this.setThemeCreateFormName.execute(value);
  }
}
