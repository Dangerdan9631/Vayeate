import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';

/** Persist theme to disk only. Single responsibility: save. */
@singleton()
export class SaveThemeOperation {
  constructor(
    private readonly themeGateway: ThemeGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) { }

  execute(theme: Theme): void {
    this.enqueueBackgroundAction.execute(
      `Saving theme ${theme.name} ${theme.version}`,
      async () => {
        await this.themeGateway.saveTheme(theme);
      }
    );
  }
}
