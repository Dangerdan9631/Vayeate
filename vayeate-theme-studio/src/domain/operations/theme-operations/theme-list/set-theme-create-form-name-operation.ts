import { singleton } from 'tsyringe';
import { ThemeCreateDialogStore } from '../../../state/ui/theme-create-dialog-store';

@singleton()
export class SetThemeCreateFormNameOperation {
  constructor(private readonly themeCreateDialogStore: ThemeCreateDialogStore) {}

  execute(value: string): void {
    this.themeCreateDialogStore.getStore().setName(value);
  }
}


