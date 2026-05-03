import { singleton } from 'tsyringe';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import { ContinuationHandler } from '../../../../app/core/background-queue/background-queue';

@singleton()
export class LoadThemeOperation {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly themeGateway: ThemeGateway,
    private readonly enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(name: string, version: string): ContinuationHandler {
    return this.enqueueBackgroundQueue.execute(
      `worker`,
      `Loading theme ${name} ${version}`,
      async () => {
        const loaded = await this.themeGateway.loadTheme(name, version);
        this.themeUiStore.getStore().setTheme(loaded);
      },
    );
  }
}


