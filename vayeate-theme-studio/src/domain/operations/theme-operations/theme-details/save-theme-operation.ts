import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { themeDataFileKey } from '../../../../model/data-path-keys';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../../model/background-queue';

@singleton()
export class SaveThemeOperation {
  constructor(
    private readonly themeGateway: ThemeGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) { }

  execute(theme: Theme): ContinuationHandler {
    return this.enqueueBackgroundAction.execute(
      'data_io',
      `Saving theme ${theme.name} ${theme.version}`,
      async () => {
        await this.themeGateway.saveTheme(theme);
      },
      { key: themeDataFileKey(theme.name, theme.version), access: 'write' },
    );
  }
}
