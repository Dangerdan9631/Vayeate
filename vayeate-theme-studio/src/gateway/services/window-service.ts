import { singleton } from 'tsyringe';

export type WindowStateEvent = 'minimized' | 'maximized' | 'unmaximized' | 'restored';

@singleton()
export class WindowService {
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

  onWindowState(callback: (event: WindowStateEvent) => void): (() => void) | undefined {
    return window.electronAPI?.onWindowState?.(callback);
  }

  onWindowResize(callback: (size: { width: number; height: number }) => void): (() => void) | undefined {
    return window.electronAPI?.onWindowResize?.(callback);
  }

  onWindowMove(callback: (position: { x: number; y: number }) => void): (() => void) | undefined {
    return window.electronAPI?.onWindowMove?.(callback);
  }
}
