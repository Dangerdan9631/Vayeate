import { singleton } from 'tsyringe';
import type { Theme } from '../../../../../model/Theme/schema/theme-schemas';
import { themeDataFileKey } from '../../../../../model/Common/data-path-keys';
import { ThemeGateway } from '../../../../../gateway/gateway/Theme/theme/theme-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../../Common/background-queue/enqueue-background-queue-action-operation';
import { createThemeWithParams } from '../../../../../model/Theme/factories/theme-factory';

/**
 * Creates theme and updates list or selection state.
 */

@singleton()
export class CreateThemeOperation {
  constructor(
    private readonly themeGateway: ThemeGateway,
    private readonly enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Runs the create theme mutation.
   * @param params Params ({ name: string, sourceTheme?: Theme | null }).
   * @returns Theme result.
   */

  execute(params: { name: string; sourceTheme?: Theme | null }): Theme {
    const theme = createThemeWithParams(params);
    this.enqueueBackgroundQueue.execute(
      'data_io',
      `Creating theme ${ params.name }`,
      () => this.themeGateway.saveTheme(theme),
      { key: themeDataFileKey(theme.name, theme.version), access: 'write' },
    );

    return theme;
  }
}
