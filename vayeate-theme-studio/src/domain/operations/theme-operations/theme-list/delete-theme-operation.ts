import { singleton } from 'tsyringe';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { BackgroundQueueGateway } from '../../../../gateway/background-queue-gateway';

/** Delete one theme version from disk. Single responsibility: delete. */
@singleton()
export class DeleteThemeOperation {
  constructor(
    private readonly themeGateway: ThemeGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) {}

  execute(name: string, version: string): void {
    this.backgroundQueueGateway.enqueue(async() => {
      await this.themeGateway.deleteTheme(name, version);
    }, `Deleting theme ${name} ${version}`);
  }
}
