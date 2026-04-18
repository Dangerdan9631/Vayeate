import { singleton } from 'tsyringe';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { EnqueueBackgroundActionOperation } from '../../app-operations/enqueue-background-action-operation';

/** Delete one theme version from disk. Single responsibility: delete. */
@singleton()
export class DeleteThemeOperation {
  constructor(
    private readonly themeGateway: ThemeGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundActionOperation,
  ) {}

  execute(name: string, version: string): void {
    this.enqueueBackgroundAction.execute(async() => {
      await this.themeGateway.deleteTheme(name, version);
    }, `Deleting theme ${name} ${version}`);
  }
}
