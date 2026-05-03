import { singleton } from 'tsyringe';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import { ContinuationHandler } from '../../../../app/core/background-queue/continuation-handler';

@singleton()
export class DeleteThemeOperation {
  constructor(
    private readonly themeGateway: ThemeGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(name: string, version: string): ContinuationHandler {
    return this.enqueueBackgroundAction.execute(
      'worker',
      `Deleting theme ${name} ${version}`,
      async () => {
        await this.themeGateway.deleteTheme(name, version);
      }
    );
  }
}
