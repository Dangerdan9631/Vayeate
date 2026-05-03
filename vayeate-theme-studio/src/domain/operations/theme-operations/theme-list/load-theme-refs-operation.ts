import { singleton } from 'tsyringe';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { ThemesStore } from '../../../state/data/themes-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import { ContinuationHandler } from '../../../../app/core/background-queue/continuation-handler';

@singleton()
export class LoadThemeRefsOperation {
  constructor(
    private readonly themesStateSetter: ThemesStore,
    private readonly themeGateway: ThemeGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(): ContinuationHandler {
    return this.enqueueBackgroundAction.execute(
      'worker',
      'Loading themes',
      async () => {
        const refs = await this.themeGateway.listThemes();
        this.themesStateSetter.getStore().setThemeMapEntries(
          refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, theme: undefined })),
        );
      }
    );
  }
}

