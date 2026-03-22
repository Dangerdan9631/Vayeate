import { singleton } from 'tsyringe';

export type ScreenshotDisplayEntry = {
  sourceId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  png: Uint8Array;
};

export type ScreenshotFullDisplaySnapshot = {
  fullBounds: { x: number; y: number; width: number; height: number };
  displays: ScreenshotDisplayEntry[];
};

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
