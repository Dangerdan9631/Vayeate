import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schemas';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { BackgroundQueueGateway } from '../../../../gateway/background-queue-gateway';

/** Persist theme to disk only. Single responsibility: save. */
@singleton()
export class SaveThemeOperation {
  constructor(
    private readonly themeGateway: ThemeGateway,
    private readonly backgroundQueueGateway: BackgroundQueueGateway,
  ) { }

  execute(theme: Theme): void {
    this.backgroundQueueGateway.enqueue(async() => {
      await this.themeGateway.saveTheme(theme);
    });
  }
}
