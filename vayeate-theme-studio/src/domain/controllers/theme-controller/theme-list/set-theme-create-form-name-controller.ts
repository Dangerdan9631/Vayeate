import { singleton } from 'tsyringe';
import { SetThemeCreateFormNameOperation } from '../../../operations/theme-operations/theme-list/set-theme-create-form-name-operation';

@singleton()
export class SetThemeCreateFormNameController {
  constructor(private readonly setThemeCreateFormName: SetThemeCreateFormNameOperation) {}

  async run(value: string): Promise<void> {
    this.setThemeCreateFormName.execute(value);
  }
}
