import { singleton } from 'tsyringe';
import { WindowCallbacksPort } from '../../domain/operations/app-operations/window-callbacks-port';
import type { KeyboardShortcutEvent, WindowInitializationCallbacks } from '../../domain/operations/app-operations/types';

/**
 * Bridges Electron window IPC and DOM events into app window callback ports.
 */
@singleton()
export class WindowService extends WindowCallbacksPort {
  private unsubscribes: Array<() => void> = [];

  private viewportRaf = 0;

  private pendingViewport: { width: number; height: number } | null = null;

  /**
   * Returns the Electron preload API or throws outside Electron.
   *
   * @returns Preload `electronAPI` with window methods.
   */
  private getAPI() {
    const api = window.electronAPI;
    if (!api) {
      throw new Error('Electron API not available. Run the app in Electron.');
    }
    return api;
  }

  /**
   * Requests application window close via IPC.
   *
   * @returns Resolves when the close request is sent.
   */
  async close(): Promise<void> {
    await this.getAPI().closeWindow?.();
  }

  /**
   * Minimizes the application window.
   *
   * @returns Resolves when the minimize request is sent.
   */
  async minimize(): Promise<void> {
    await this.getAPI().minimizeWindow?.();
  }

  /**
   * Maximizes the application window.
   *
   * @returns Resolves when the maximize request is sent.
   */
  async maximize(): Promise<void> {
    await this.getAPI().maximizeWindow?.();
  }

  /**
   * Restores the application window from minimized or maximized state.
   *
   * @returns Resolves when the restore request is sent.
   */
  async restore(): Promise<void> {
    await this.getAPI().restoreWindow?.();
  }

  /**
   * Starts a custom title-bar drag session.
   *
   * @returns Resolves when the drag request is sent.
   */
  async drag(): Promise<void> {
    await this.getAPI().dragWindow?.();
  }

  /**
   * Reloads the renderer window.
   *
   * @returns Resolves when the reload request is sent.
   */
  async reload(): Promise<void> {
    await this.getAPI().reloadWindow?.();
  }

  /**
   * Force-reloads the renderer window, bypassing cache.
   *
   * @returns Resolves when the reload request is sent.
   */
  async reloadForce(): Promise<void> {
    await this.getAPI().reloadWindowForce?.();
  }

  /**
   * Toggles developer tools for the renderer window.
   *
   * @returns Resolves when the toggle request is sent.
   */
  async toggleDevTools(): Promise<void> {
    await this.getAPI().toggleDevTools?.();
  }

  /**
   * Reads the native BrowserWindow bounds from the main process.
   *
   * @returns Window position and size in screen coordinates.
   */
  async getWindowBounds(): Promise<{ x: number; y: number; width: number; height: number }> {
    return this.getAPI().getWindowBounds();
  }

  /**
   * Registers window state, global shortcut, and viewport resize listeners.
   *
   * @param callbacks - App-supplied handlers for window and input events.
   * @returns Nothing.
   */
  initialize(callbacks: WindowInitializationCallbacks): void {
    const api = this.getAPI();
    for (const u of this.unsubscribes) {
      u();
    }
    this.unsubscribes = [];

    const push = (u: (() => void) | undefined) => {
      if (u) this.unsubscribes.push(u);
    };
    push(api.onWindowState?.(callbacks.onStateEvent));

    const onGlobalKeyDown = (event: KeyboardEvent) => {
      const shortcutEvent: KeyboardShortcutEvent = {
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        key: event.key,
        preventDefault: () => event.preventDefault(),
      };
      callbacks.onGlobalKeyDown(shortcutEvent);
    };
    window.addEventListener('keydown', onGlobalKeyDown);
    push(() => window.removeEventListener('keydown', onGlobalKeyDown));

    const flushViewport = () => {
      this.viewportRaf = 0;
      if (this.pendingViewport == null) return;
      const size = this.pendingViewport;
      this.pendingViewport = null;
      callbacks.onViewportResize(size);
    };

    let viewportHydrated = false;
    const onViewportResize = () => {
      this.pendingViewport = { width: window.innerWidth, height: window.innerHeight };
      if (!viewportHydrated) {
        viewportHydrated = true;
        flushViewport();
        return;
      }
      if (this.viewportRaf !== 0) return;
      this.viewportRaf = requestAnimationFrame(flushViewport);
    };
    window.addEventListener('resize', onViewportResize);
    push(() => {
      window.removeEventListener('resize', onViewportResize);
      if (this.viewportRaf !== 0) {
        cancelAnimationFrame(this.viewportRaf);
        this.viewportRaf = 0;
      }
      this.pendingViewport = null;
    });
    onViewportResize();

    // One-shot hydration on init: set initial BrowserWindow bounds into state if available.
    void api
      .getWindowBounds?.()
      .then((b) => {
        callbacks.onMove?.({ x: b.x, y: b.y });
        callbacks.onResize?.({ width: b.width, height: b.height });
      })
      .catch(() => {});
  }

  /**
   * Removes all listeners registered by `initialize`.
   *
   * @returns Nothing.
   */
  override dispose(): void {
    for (const u of this.unsubscribes) {
      u();
    }
    this.unsubscribes = [];
    this.pendingViewport = null;
  }
}
