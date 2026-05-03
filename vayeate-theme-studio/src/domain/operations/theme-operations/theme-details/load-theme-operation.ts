import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';

@singleton()
export class LoadThemeOperation {
  constructor(
    private readonly themeUiStore: ThemeUiStore,
    private readonly themeGateway: ThemeGateway,
    private readonly enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(name: string, version: string): Promise<Theme | null> {
    return this.enqueueBackgroundQueue.executeReturning(
      `Loading theme ${name} ${version}`,
      async () => {
        const loaded = await this.themeGateway.loadTheme(name, version);
        this.themeUiStore.getStore().setTheme(loaded);
        return loaded;
      },
    );
  }
}


