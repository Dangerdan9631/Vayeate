import { singleton } from 'tsyringe';
import { BackgroundQueuePort } from '../../../../domain/operations/Queue/background-queue/background-queue-port';
import { themeDataFileKey } from '../../../../model/Common/data-path-keys';
import type { Theme } from '../../../../model/Theme/schema/theme-schemas';
import { LiveThemeExportGateway } from './live-theme-export-gateway';
import { ThemeGateway } from './theme-gateway';

/**
 * Delay before flushing a scheduled theme persist to disk.
 */
export const SAVE_THEME_DEBOUNCE_MS = 400;

/**
 * Theme payload held until the debounce timer fires.
 */
interface PendingThemePersist {
  theme: Theme;
  onError?: (message: string) => void;
}

/**
 * Debounces theme payloads so rapid edits coalesce into one keyed persist job.
 */
@singleton()
export class DebouncedThemePersistGateway {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  private previewRefreshTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private pendingPersist: PendingThemePersist | null = null;

  private pendingPreviewTheme: Theme | null = null;

  constructor(
    private readonly backgroundQueue: BackgroundQueuePort,
    private readonly themeGateway: ThemeGateway,
    private readonly liveThemeExport: LiveThemeExportGateway,
  ) {}

  /**
   * Clears any pending debounced persist without writing.
   *
   * @returns Nothing.
   */
  cancel(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.previewRefreshTimeoutId !== null) {
      clearTimeout(this.previewRefreshTimeoutId);
      this.previewRefreshTimeoutId = null;
    }

    this.pendingPersist = null;
    this.pendingPreviewTheme = null;
  }

  /**
   * Coalesces a live preview-host refresh without persisting the supplied theme.
   *
   * @param theme - Latest complete theme snapshot to export to an open preview host.
   * @param onError - Optional handler when the live export rejects.
   */
  schedulePreviewRefresh(theme: Theme, onError?: (message: string) => void): void {
    if (!this.liveThemeExport.isEnabled()) {
      return;
    }

    this.pendingPreviewTheme = theme;
    if (this.previewRefreshTimeoutId !== null) {
      clearTimeout(this.previewRefreshTimeoutId);
    }

    this.previewRefreshTimeoutId = setTimeout(() => {
      this.previewRefreshTimeoutId = null;
      const pendingTheme = this.pendingPreviewTheme;
      this.pendingPreviewTheme = null;
      if (!pendingTheme) {
        return;
      }

      this.backgroundQueue.enqueue(
        'data_io',
        `Refreshing preview host for ${pendingTheme.name} ${pendingTheme.version}`,
        async () => {
          try {
            await this.liveThemeExport.exportThemePair(pendingTheme);
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            onError?.(message);
          }
        },
        { key: themeDataFileKey(pendingTheme.name, pendingTheme.version), access: 'write' },
      );
    }, SAVE_THEME_DEBOUNCE_MS);
  }

  /**
   * Replaces any pending persist and schedules a keyed write after the debounce window.
   *
   * @param theme - Latest complete theme to persist after the debounce window.
   * @param onError - Optional handler when persist or live export rejects.
   * @returns Nothing.
   */
  schedule(theme: Theme, onError?: (message: string) => void): void {
    this.pendingPersist = { theme, onError };
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.timeoutId = null;
      const pendingPersist = this.pendingPersist;
      this.pendingPersist = null;
      if (!pendingPersist) {
        return;
      }

      const { theme, onError } = pendingPersist;
      this.backgroundQueue.enqueue(
        'data_io',
        `Saving theme ${theme.name} ${theme.version}`,
        async () => {
          try {
            await this.themeGateway.saveTheme(theme);
            await this.liveThemeExport.exportThemePair(theme);
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            onError?.(message);
          }
        },
        { key: themeDataFileKey(theme.name, theme.version), access: 'write' },
      );
    }, SAVE_THEME_DEBOUNCE_MS);
  }
}
