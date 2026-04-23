import { singleton } from 'tsyringe';
import { SetThemeCreateFormNameOperation } from '../../../../../domain/operations/theme-operations/theme-list/set-theme-create-form-name-operation';

@singleton()
export class SetThemeCreateFormNameController {
  constructor(private readonly setThemeCreateFormName: SetThemeCreateFormNameOperation) {}

  run(value: string): void {
    this.setThemeCreateFormName.execute(value);
  }
}
