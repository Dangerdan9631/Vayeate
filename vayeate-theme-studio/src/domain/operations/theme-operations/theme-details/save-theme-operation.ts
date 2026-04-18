import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { EnqueueBackgroundActionOperation } from '../../app-operations/enqueue-background-action-operation';

/** Persist theme to disk only. Single responsibility: save. */
@singleton()
export class SaveThemeOperation {
  constructor(
    private readonly themeGateway: ThemeGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundActionOperation,
  ) { }

  execute(theme: Theme): void {
    this.enqueueBackgroundAction.execute(async() => {
      await this.themeGateway.saveTheme(theme);
    }, `Saving theme ${theme.name} ${theme.version}`);
  }
}
