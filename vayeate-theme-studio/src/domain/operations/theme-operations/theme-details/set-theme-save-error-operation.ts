import { singleton } from 'tsyringe';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

@singleton()
export class SetThemeSaveErrorOperation {
  constructor(private readonly themeUiStore: ThemeUiStore) {}

  execute(error: string | null): void {
    this.themeUiStore.getStore().setSaveError(error);
  }
}


