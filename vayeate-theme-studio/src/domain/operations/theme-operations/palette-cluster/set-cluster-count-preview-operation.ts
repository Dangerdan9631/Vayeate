import { singleton } from 'tsyringe';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

/**
 * Updates cluster count preview in the domain or UI store.
 */

@singleton()
export class SetClusterCountPreviewOperation {
  constructor(private readonly themeUiStore: ThemeUiStore) {}

  /**
   * Runs the set cluster count preview mutation.
   * @param value Value (number).
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(value: number): void {
    const k = Math.max(1, Math.min(12, value));
    this.themeUiStore.getStore().setPreviewClusterCountK(k);
  }
}
