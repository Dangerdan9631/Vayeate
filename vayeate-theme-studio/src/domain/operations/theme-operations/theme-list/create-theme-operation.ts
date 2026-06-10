import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
import { themeDataFileKey } from '../../../../model/data-path-keys';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import { createThemeWithParams } from '../../../../model/factories/theme-factory';

@singleton()
export class CreateThemeOperation {
  constructor(
    private readonly themeGateway: ThemeGateway,
    private readonly enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(params: { name: string }): Theme {
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
