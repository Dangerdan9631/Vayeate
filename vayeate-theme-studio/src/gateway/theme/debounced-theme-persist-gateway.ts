import { singleton } from 'tsyringe';
import { BackgroundQueuePort } from '../../domain/operations/background-queue/background-queue-port';
import { themeDataFileKey } from '../../model/data-path-keys';
import type { Theme } from '../../model/schema/theme-schemas';
import { ThemeGateway } from './theme-gateway';

/**
 * Delay before flushing a scheduled theme persist to disk.
 */
const SAVE_THEME_DEBOUNCE_MS = 400;

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

  private pendingPersist: PendingThemePersist | null = null;

  constructor(
    private readonly backgroundQueue: BackgroundQueuePort,
    private readonly themeGateway: ThemeGateway,
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

    this.pendingPersist = null;
  }

  /**
   * Replaces any pending persist and schedules a keyed write after the debounce window.
   *
   * @param theme - Latest complete theme to persist after the debounce window.
   * @param onError - Optional handler when persist rejects.
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
