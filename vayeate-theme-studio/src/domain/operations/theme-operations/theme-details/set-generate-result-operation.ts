import { singleton } from 'tsyringe';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

/**
 * Updates generate result in the domain or UI store.
 */

@singleton()
export class SetGenerateResultOperation {
  constructor(private readonly themeUiStore: ThemeUiStore) {}

  /**
   * Runs the set generate result mutation.
   * @param result Result ({ success: boolean; message: string } | null).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(result: { success: boolean; message: string } | null): void {
    this.themeUiStore.getStore().setGenerateResult(result);
  }
}


