import { singleton } from 'tsyringe';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';

@singleton()
export class SetClusterCountPreviewOperation {
  constructor(private readonly themeUiStore: ThemeUiStore) {}

  execute(value: number): void {
    const k = Math.max(1, Math.min(12, value));
    this.themeUiStore.getStore().setPreviewClusterCountK(k);
  }
}
