import { singleton } from 'tsyringe';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import { ContinuationHandler } from '../../../../app/core/background-queue/continuation-handler';

@singleton()
export class LoadThemeOperation {
  constructor(
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
        const selectedRef = this.themeUiStore.getStore().state.selectedRef;
        if (selectedRef?.name === name && selectedRef.version === version) {
          this.themeUiStore.getStore().setThemeLoadState(loaded ? 'loaded' : 'unloaded');
        }
      },
    );
  }
}

