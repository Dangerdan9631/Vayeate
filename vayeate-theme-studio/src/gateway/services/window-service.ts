import { singleton } from 'tsyringe';
import { WindowCallbacksPort } from '../../domain/operations/app-operations/window-callbacks-port';
import type { KeyboardShortcutEvent, WindowInitializationCallbacks } from '../../domain/operations/app-operations/types';

@singleton()
export class WindowService extends WindowCallbacksPort {
  private unsubscribes: Array<() => void> = [];

  private viewportRaf = 0;

  private pendingViewport: { width: number; height: number } | null = null;

  private getAPI() {
    const api = window.electronAPI;
    if (!api) {
      throw new Error('Electron API not available. Run the app in Electron.');
    }
    return api;
  }

  async close(): Promise<void> {
    await this.getAPI().closeWindow?.();
  }

  async minimize(): Promise<void> {
    await this.getAPI().minimizeWindow?.();
  }

  async maximize(): Promise<void> {
    await this.getAPI().maximizeWindow?.();
  }

  async restore(): Promise<void> {
    await this.getAPI().restoreWindow?.();
  }

  async drag(): Promise<void> {
    await this.getAPI().dragWindow?.();
  }

  async reload(): Promise<void> {
    await this.getAPI().reloadWindow?.();
  }

  async reloadForce(): Promise<void> {
    await this.getAPI().reloadWindowForce?.();
  }

  async toggleDevTools(): Promise<void> {
    await this.getAPI().toggleDevTools?.();
  }

  async getWindowBounds(): Promise<{ x: number; y: number; width: number; height: number }> {
    return this.getAPI().getWindowBounds();
  }

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

  override dispose(): void {
    for (const u of this.unsubscribes) {
      u();
    }
    this.unsubscribes = [];
    this.pendingViewport = null;
  }
}
