import { singleton } from 'tsyringe';

/**
 * Renderer facade for HTTP fetch through the Electron main process.
 */
@singleton()
export class WebService {
  /**
   * Returns the Electron preload API or throws outside Electron.
   *
   * @returns Preload `electronAPI` with fetch methods.
   */
  private getAPI() {
    const api = window.electronAPI;
    if (!api) {
      throw new Error('Electron API not available. Run the app in Electron.');
    }
    return api;
  }

  /**
   * Fetches a URL and returns the response body as text.
   *
   * @param url - Absolute URL to request.
   * @returns Response body text from the main-process fetch.
   */
  async fetchUrl(url: string): Promise<string> {
    return this.getAPI().fetchUrl(url);
  }
}
