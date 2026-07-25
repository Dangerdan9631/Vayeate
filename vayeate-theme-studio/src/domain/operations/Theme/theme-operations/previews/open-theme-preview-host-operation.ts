import { singleton } from 'tsyringe';
import { LiveThemeExportGateway } from '../../../../../gateway/gateway/Theme/theme/live-theme-export-gateway';
import { ThemePreviewHostService } from '../../../../../gateway/services/Common/theme-preview-host-service';
import type { BackgroundQueueContinuation as ContinuationHandler } from '../../../../../model/Queue/background-queue';
import type { Theme } from '../../../../../model/Theme/schema/theme-schemas';
import { ThemePreviewStore } from '../../../../state/Theme/ui/theme-preview-store';
import { EnqueueBackgroundQueueActionOperation } from '../../../Queue/background-queue/enqueue-background-queue-action-operation';

/**
 * Generates the active theme extension files and launches the VS Code preview host.
 */
@singleton()
export class OpenThemePreviewHostOperation {
  constructor(
    private readonly themePreviewStore: ThemePreviewStore,
    private readonly liveThemeExport: LiveThemeExportGateway,
    private readonly themePreviewHostService: ThemePreviewHostService,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Schedules preview extension generation and host launch.
   *
   * @param theme - Current selected theme snapshot.
   */
  execute(theme: Theme): ContinuationHandler {
    const wasEnabled =
      this.themePreviewStore.getStore().state.isPreviewHostEnabled;
    this.themePreviewStore.getStore().setPreviewHostStatus({
      isEnabled: wasEnabled,
      isOpening: true,
      error: null,
    });

    return this.enqueueBackgroundAction.execute(
      'deferred',
      `Opening VS Code preview host for ${theme.name}`,
      async () => {
        try {
          this.liveThemeExport.enable();
          await this.liveThemeExport.exportThemePair(theme);
          await this.themePreviewHostService.open(theme.name);
          this.themePreviewStore.getStore().setPreviewHostStatus({
            isEnabled: true,
            isOpening: false,
            error: null,
          });
        } catch (error) {
          if (!wasEnabled) {
            this.liveThemeExport.disable();
          }
          const message =
            error instanceof Error ? error.message : String(error);
          this.themePreviewStore.getStore().setPreviewHostStatus({
            isEnabled: wasEnabled,
            isOpening: false,
            error: message,
          });
        }
      },
    );
  }
}
