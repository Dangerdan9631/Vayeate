import { singleton } from 'tsyringe';
import { ThemeGateway } from '../../../../../gateway/gateway/Theme/theme/theme-gateway';
import { ThemesStore } from '../../../../state/Theme/data/themes-store';
import { ThemeUiStore } from '../../../../state/Theme/ui/theme-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../../../Common/background-queue/enqueue-background-queue-action-operation';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../../../model/Common/background-queue';

/**
 * Loads theme refs from persistence into the store.
 */

@singleton()
export class LoadThemeRefsOperation {
  constructor(
    private readonly themesStateSetter: ThemesStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly themeGateway: ThemeGateway,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Runs the load theme refs mutation.
   * @returns Background-queue continuation for chained async work.
   */

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

