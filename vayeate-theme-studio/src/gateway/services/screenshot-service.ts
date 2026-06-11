import { singleton } from 'tsyringe';
import type { ScreenshotFullDisplaySnapshot } from './screenshot-service-types';

/**
 * Captures full-display screenshots for the eyedropper overlay via Electron IPC.
 */
@singleton()
export class ScreenshotService {
  /**
   * Returns the Electron preload API or throws outside Electron.
   *
   * @returns Preload `electronAPI` with screenshot methods.
   */
  private getAPI() {
    const api = window.electronAPI;
    if (!api) {
      throw new Error('Electron API not available. Run the app in Electron.');
    }
    return api;
  }

  /**
   * Captures all displays as PNG bytes with bounds metadata.
   *
   * @returns Full virtual desktop bounds and per-display image data.
   */
  async getFullDisplaySnapshot(): Promise<ScreenshotFullDisplaySnapshot> {
    return this.getAPI().screenshotGetFullDisplaySnapshot();
  }
}
