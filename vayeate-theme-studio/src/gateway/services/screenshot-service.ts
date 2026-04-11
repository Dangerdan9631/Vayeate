import { singleton } from 'tsyringe';
import type { ScreenshotFullDisplaySnapshot } from './screenshot-service-types';

@singleton()
export class ScreenshotService {
  private getAPI() {
    const api = window.electronAPI;
    if (!api) {
      throw new Error('Electron API not available. Run the app in Electron.');
    }
    return api;
  }

  async getFullDisplaySnapshot(): Promise<ScreenshotFullDisplaySnapshot> {
    return this.getAPI().screenshotGetFullDisplaySnapshot();
  }
}
