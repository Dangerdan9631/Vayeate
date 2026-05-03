import { singleton } from 'tsyringe';
import { ThemeCreateDialogStore } from '../../../state/ui/theme-create-dialog-store';

@singleton()
export class SetThemeCreateDialogOpenOperation {
  constructor(private readonly themeCreateDialogStore: ThemeCreateDialogStore) {}

  execute(value: boolean): void {
    this.themeCreateDialogStore.getStore().setOpen(value);
  }
}


