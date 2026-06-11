import { singleton } from 'tsyringe';
import { themeDataFileKey } from '../../../../model/data-path-keys';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../../model/background-queue';

/**
 * Deletes theme and refreshes related list or selection state.
 */

@singleton()
export class DeleteThemeOperation {
  constructor(
    private readonly themeGateway: ThemeGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Runs the delete theme mutation.
   * @param name Name (string).
   * @param version Version (string).
   * @returns Background-queue continuation for chained async work.
   */

  execute(name: string, version: string): ContinuationHandler {
    return this.enqueueBackgroundAction.execute(
      'data_io',
      `Deleting theme ${name} ${version}`,
      async () => {
        await this.themeGateway.deleteTheme(name, version);
      },
      { key: themeDataFileKey(name, version), access: 'write' },
    );
  }
}
