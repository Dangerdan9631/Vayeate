import { singleton } from 'tsyringe';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { ThemesStore } from '../../../state/data/themes-store';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../../model/background-queue';

@singleton()
export class LoadThemeOperation {
  constructor(
    private readonly themesStore: ThemesStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly themeGateway: ThemeGateway,
    private readonly enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(name: string, version: string): ContinuationHandler {
    return this.enqueueBackgroundQueue.execute(
      'data_io',
      `Loading theme ${name} ${version}`,
      async () => {
        const loaded = await this.themeGateway.loadTheme(name, version);
        this.themeUiStore.getStore().setTheme(loaded);
        if (loaded) {
          this.themesStore.getStore().updateTheme(loaded);
        }
        const selectedRef = this.themeUiStore.getStore().state.selectedRef;
        if (selectedRef?.name === name && selectedRef.version === version) {
          this.themeUiStore.getStore().setThemeLoadState(loaded ? 'loaded' : 'unloaded');
        }
      },
    );
  }
}
