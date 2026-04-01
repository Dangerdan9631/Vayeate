import { singleton } from 'tsyringe';

export type WindowStateEvent = 'minimized' | 'maximized' | 'unmaximized' | 'restored';
export interface WindowInitCallbacks {
  onStateEvent: (event: WindowStateEvent) => void;
  onResize: (size: { width: number; height: number }) => void;
  onMove: (position: { x: number; y: number }) => void;
  onViewportResize: (size: { width: number; height: number }) => void;
  onGlobalKeyDown: (e: KeyboardEvent) => void;
}

@singleton()
export class WindowService {
  private unsubscribes: Array<() => void> = [];

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

  init(callbacks: WindowInitCallbacks): void {
    const api = this.getAPI();
    for (const u of this.unsubscribes) {
      u();
    }
    this.unsubscribes = [];

    const push = (u: (() => void) | undefined) => {
      if (u) this.unsubscribes.push(u);
    };
    push(api.onWindowState?.(callbacks.onStateEvent));
    push(api.onWindowResize?.(callbacks.onResize));
    push(api.onWindowMove?.(callbacks.onMove));

    window.addEventListener('keydown', callbacks.onGlobalKeyDown as EventListener);
    push(() => window.removeEventListener('keydown', callbacks.onGlobalKeyDown as EventListener));

    const onViewportResize = () => callbacks.onViewportResize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onViewportResize);
    push(() => window.removeEventListener('resize', onViewportResize));
    onViewportResize();

    // One-shot hydration on init: set initial BrowserWindow bounds into state if available.
    void api
      .getWindowBounds?.()
      .then((b) => {
        callbacks.onMove({ x: b.x, y: b.y });
        callbacks.onResize({ width: b.width, height: b.height });
      })
      .catch(() => {});
  }

  dispose(): void {
    for (const u of this.unsubscribes) {
      u();
    }
    this.unsubscribes = [];
  }
}
