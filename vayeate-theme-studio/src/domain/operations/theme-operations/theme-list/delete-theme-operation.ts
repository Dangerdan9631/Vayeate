import { singleton } from 'tsyringe';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';

/** Delete one theme version from disk. Single responsibility: delete. */
@singleton()
export class DeleteThemeOperation {
  constructor(
    private readonly themeGateway: ThemeGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(name: string, version: string): void {
    this.enqueueBackgroundAction.execute(
      `Deleting theme ${name} ${version}`,
      async () => {
        await this.themeGateway.deleteTheme(name, version);
      }
    );
  }
}
