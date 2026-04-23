import { singleton } from 'tsyringe';
import { SetThemeCreateDialogOpenOperation } from '../../../../../domain/operations/theme-operations/theme-list/set-theme-create-dialog-open-operation';

@singleton()
export class OpenThemeCreateDialogController {
  constructor(private readonly setThemeCreateDialogOpen: SetThemeCreateDialogOpenOperation) {}

  run(): void {
    this.setThemeCreateDialogOpen.execute(true);
  }
}
