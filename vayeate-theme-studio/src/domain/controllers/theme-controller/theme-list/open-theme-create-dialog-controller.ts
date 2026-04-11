import { singleton } from 'tsyringe';
import { SetThemeCreateDialogOpenOperation } from '../../../operations/theme-operations/theme-list/set-theme-create-dialog-open-operation';

@singleton()
export class OpenThemeCreateDialogController {
  constructor(private readonly setThemeCreateDialogOpen: SetThemeCreateDialogOpenOperation) {}

  async run(): Promise<void> {
    this.setThemeCreateDialogOpen.execute(true);
  }
}
