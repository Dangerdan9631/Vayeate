import { singleton } from 'tsyringe';
import { ThemeGateway } from '../../../../gateway/theme/theme-gateway';
import { ThemesStore } from '../../../state/data/themes-store';
import { ThemeUiStore } from '../../../state/ui/theme-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../../model/background-queue';

@singleton()
export class LoadThemeRefsOperation {
  constructor(
    private readonly themesStateSetter: ThemesStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly themeGateway: ThemeGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(): ContinuationHandler {
    this.themeUiStore.getStore().setPageLoadState('loading');

    return this.enqueueBackgroundAction.execute(
      'data_io',
      'Loading themes',
      async () => {
        const refs = await this.themeGateway.listThemes();
        if (this.themeUiStore.getStore().state.pageLoadState === 'loading') {
          this.themeUiStore.getStore().setPageLoadState('loaded');
          this.themesStateSetter.getStore().setThemeMapEntries(
            refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, theme: undefined })),
          );
        }
      }
    );
  }
}

