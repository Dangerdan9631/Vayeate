import { singleton } from 'tsyringe';
import { ThemeCreateDialogStore } from '../../../state/ui/theme-create-dialog-store';

@singleton()
export class SetThemeIsCreatingOperation {
  constructor(private readonly themeCreateDialogStore: ThemeCreateDialogStore) {}

  execute(value: boolean): void {
    this.themeCreateDialogStore.getStore().setIsCreating(value);
  }
}


