import { singleton } from 'tsyringe';
import { themeDataFileKey } from '../../../../../model/Common/data-path-keys';
import { ThemeGateway } from '../../../../../gateway/gateway/Theme/theme/theme-gateway';
import { getLoadedTheme } from '../../../../state/Theme/data/themes-state';
import { ThemesStore } from '../../../../state/Theme/data/themes-store';
import { ThemeUiStore } from '../../../../state/Theme/ui/theme-ui-store';
import { immediateContinuation } from '../../../Queue/background-queue/immediate-continuation';
import { EnqueueBackgroundQueueActionOperation } from '../../../Queue/background-queue/enqueue-background-queue-action-operation';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../../../model/Queue/background-queue';

/**
 * Loads theme from persistence into the store.
 */

@singleton()
export class LoadThemeOperation {
  constructor(
    private readonly themesStore: ThemesStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly themeGateway: ThemeGateway,
    private readonly enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Runs the load theme mutation.
   * @param name Name (string).
   * @param version Version (string).
   * @returns Background-queue continuation for chained async work.
   */

  execute(name: string, version: string): ContinuationHandler {
    const ref = { name, version };
    const cached = getLoadedTheme(this.themesStore.getStore().state.themeMap, ref);
    if (cached) {
      this.themeUiStore.getStore().setTheme(cached);
      const selectedRef = this.themeUiStore.getStore().state.selectedRef;
      if (selectedRef?.name === name && selectedRef.version === version) {
        this.themeUiStore.getStore().setThemeLoadState('loaded');
      }
      return immediateContinuation();
    }

    return this.enqueueBackgroundQueue.execute(
      'data_io',
      `Loading theme ${name} ${version}`,
      async () => {
        const loaded = await this.themeGateway.loadTheme(name, version);
        this.themeUiStore.getStore().setTheme(loaded);
        if (loaded) {
          this.themesStore.getStore().updateTheme(loaded);
        }
        const selectedRef = this.themeUiStore.getStore().state.selectedRef;
        if (selectedRef?.name === name && selectedRef.version === version) {
          this.themeUiStore.getStore().setThemeLoadState(loaded ? 'loaded' : 'unloaded');
        }
      },
      { key: themeDataFileKey(name, version), access: 'read' },
    );
  }
}
