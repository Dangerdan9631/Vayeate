import { singleton } from 'tsyringe';

/**
 * Delay before flushing a scheduled theme persist to disk.
 */
const SAVE_THEME_DEBOUNCE_MS = 400;

/**
 * Callback bundle held until the debounce timer fires.
 */
interface PendingThemePersist {
  persist: () => Promise<void>;
  onError?: (message: string) => void;
}

/**
 * Debounces theme save callbacks so rapid edits coalesce into one persist.
 */
@singleton()
export class DebouncedThemePersistGateway {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  private pendingPersist: PendingThemePersist | null = null;

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
   * Replaces any pending persist and schedules the callback after the debounce window.
   *
   * @param persist - Async write to run when the timer elapses.
   * @param onError - Optional handler when persist rejects.
   * @returns Nothing.
   */
  schedule(persist: () => Promise<void>, onError?: (message: string) => void): void {
    this.pendingPersist = { persist, onError };
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

      pendingPersist.persist().catch((err) => {
        const message = err instanceof Error ? err.message : String(err);
        pendingPersist.onError?.(message);
      });
    }, SAVE_THEME_DEBOUNCE_MS);
  }
}
