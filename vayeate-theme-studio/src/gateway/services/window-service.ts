import { singleton } from 'tsyringe';

export type WindowStateEvent = 'minimized' | 'maximized' | 'unmaximized' | 'restored';

@singleton()
export class WindowService {
  private ipcUnsubscribes: Array<() => void> = [];

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

  init(
    onStateEvent: (event: WindowStateEvent) => void,
    onResize: (size: { width: number; height: number }) => void,
    onMove: (position: { x: number; y: number }) => void,
  ): void {
    
    for (const u of this.ipcUnsubscribes) {
      u();
    }
    this.ipcUnsubscribes = [];

    const push = (u: (() => void) | undefined) => {
      if (u) this.ipcUnsubscribes.push(u);
    };
    push(this.getAPI().onWindowState?.(onStateEvent));
    push(this.getAPI().onWindowResize?.(onResize));
    push(this.getAPI().onWindowMove?.(onMove));
  }

  disposeIpcListeners(): void {
    for (const u of this.ipcUnsubscribes) {
      u();
    }
    this.ipcUnsubscribes = [];
  }
}
