import { singleton } from 'tsyringe';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

@singleton()
export class SetGenerateResultOperation {
  constructor(private readonly themeUiStore: ThemeUiStore) {}

  execute(result: { success: boolean; message: string } | null): void {
    this.themeUiStore.getStore().setGenerateResult(result);
  }
}


