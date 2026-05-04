import { singleton } from 'tsyringe';
import type { Theme } from '../../../../model/schema/theme-schemas';
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
      `Creating theme ${ params.name }`, () =>
        this.themeGateway.saveTheme(theme),
    );

    return theme;
  }
}
