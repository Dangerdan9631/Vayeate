import { singleton } from 'tsyringe';

const SAVE_THEME_DEBOUNCE_MS = 400;

interface PendingThemePersist {
  persist: () => Promise<void>;
  onError?: (message: string) => void;
}

/**
 * Debounced theme file persist; timer and pending theme are instance state (no module-level globals).
 */
@singleton()
export class DebouncedThemePersistService {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  private pendingPersist: PendingThemePersist | null = null;

  cancel(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.pendingPersist = null;
  }

  schedule(persist: () => Promise<void>, onError?: (message: string) => void): void {
    this.pendingPersist = { persist, onError };
    if (this.timeoutId !== null) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.timeoutId = null;
      const pendingPersist = this.pendingPersist;
      this.pendingPersist = null;
      if (pendingPersist) {
        pendingPersist.persist().catch((err) => {
          const message = err instanceof Error ? err.message : String(err);
          pendingPersist.onError?.(message);
        });
      }
    }, SAVE_THEME_DEBOUNCE_MS);
  }
}

