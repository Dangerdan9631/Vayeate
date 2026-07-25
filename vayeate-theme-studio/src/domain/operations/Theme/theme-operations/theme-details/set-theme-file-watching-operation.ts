import { singleton } from 'tsyringe';
import { TemplateGateway } from '../../../../../gateway/gateway/Template/template/template-gateway';
import { DebouncedThemePersistGateway } from '../../../../../gateway/gateway/Theme/theme/debounced-theme-persist-gateway';
import { ThemeGateway } from '../../../../../gateway/gateway/Theme/theme/theme-gateway';
import { themeDataFileKey } from '../../../../../model/Common/data-path-keys';
import type { ThemeReference } from '../../../../../model/Theme/schema/theme-schemas';
import { ThemesStore } from '../../../../state/Theme/data/themes-store';
import { ThemePreviewStore } from '../../../../state/Theme/ui/theme-preview-store';
import { ThemeUiStore } from '../../../../state/Theme/ui/theme-ui-store';
import { mergeThemeWithTemplateAssignments } from '../../../../utils/Theme/merge-theme-with-template-assignments';
import { EnqueueBackgroundQueueActionOperation } from '../../../Queue/background-queue/enqueue-background-queue-action-operation';

/**
 * Owns the page-scoped watcher for the selected theme and applies external file updates.
 */
@singleton()
export class SetThemeFileWatchingOperation {
  private unsubscribeSelection: (() => void) | null = null;
  private stopFileWatch: (() => Promise<void>) | null = null;
  private watchGeneration = 0;

  constructor(
    private readonly themesStore: ThemesStore,
    private readonly themeUiStore: ThemeUiStore,
    private readonly themePreviewStore: ThemePreviewStore,
    private readonly themeGateway: ThemeGateway,
    private readonly templateGateway: TemplateGateway,
    private readonly debouncedThemePersist: DebouncedThemePersistGateway,
    private readonly enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Enables or disables watching while the Themes page is mounted.
   *
   * @param enabled - True to follow the selected theme; false to release all watchers.
   */
  execute(enabled: boolean): void {
    if (!enabled) {
      this.unsubscribeSelection?.();
      this.unsubscribeSelection = null;
      this.watchGeneration += 1;
      const stop = this.stopFileWatch;
      this.stopFileWatch = null;
      if (stop) void stop().catch(() => undefined);
      return;
    }

    if (this.unsubscribeSelection) return;
    this.unsubscribeSelection = this.themeUiStore.api.subscribe((next, previous) => {
      const nextRef = next.state.selectedRef;
      const previousRef = previous.state.selectedRef;
      if (nextRef?.name === previousRef?.name && nextRef?.version === previousRef?.version) return;
      void this.switchWatch(nextRef).catch(() => undefined);
    });
    void this.switchWatch(this.themeUiStore.getStore().state.selectedRef).catch(() => undefined);
  }

  private async switchWatch(ref: ThemeReference | null): Promise<void> {
    const generation = ++this.watchGeneration;
    const stop = this.stopFileWatch;
    this.stopFileWatch = null;
    if (stop) await stop();
    if (!ref || generation !== this.watchGeneration || !this.unsubscribeSelection) return;

    const nextStop = await this.themeGateway.watchTheme(ref.name, ref.version, () => {
      this.debouncedThemePersist.cancel();
      this.reloadExternalTheme(ref);
    });
    if (generation !== this.watchGeneration || !this.unsubscribeSelection) {
      await nextStop();
      return;
    }
    this.stopFileWatch = nextStop;
  }

  private reloadExternalTheme(ref: ThemeReference): void {
    this.enqueueBackgroundQueue.execute(
      'data_io',
      `Reloading externally changed theme ${ref.name} ${ref.version}`,
      async () => {
        const selectedRef = this.themeUiStore.getStore().state.selectedRef;
        if (selectedRef?.name !== ref.name || selectedRef.version !== ref.version) return;

        const loaded = await this.themeGateway.loadTheme(ref.name, ref.version);
        if (!loaded) return;
        const template = loaded.templateRef
          ? await this.templateGateway.loadTemplate(
            loaded.templateRef.name,
            loaded.templateRef.version,
          )
          : null;
        const theme = template ? mergeThemeWithTemplateAssignments(loaded, template) : loaded;

        const currentRef = this.themeUiStore.getStore().state.selectedRef;
        if (currentRef?.name !== ref.name || currentRef.version !== ref.version) return;
        this.themesStore.getStore().updateTheme(theme);
        this.themeUiStore.getStore().setTheme(theme);
        this.themeUiStore.getStore().setThemeLoadState('loaded');
        this.themePreviewStore.getStore().setLoadedTemplate(template);
        this.debouncedThemePersist.schedulePreviewRefresh(theme);
      },
      { key: themeDataFileKey(ref.name, ref.version), access: 'read' },
    );
  }
}
