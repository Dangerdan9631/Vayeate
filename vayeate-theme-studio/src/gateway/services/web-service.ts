import { singleton } from 'tsyringe';

@singleton()
export class WebService {
  private getAPI() {
    const api = window.electronAPI;
    if (!api) {
      throw new Error('Electron API not available. Run the app in Electron.');
    }
    return api;
  }

  async fetchUrl(url: string): Promise<string> {
    return this.getAPI().fetchUrl(url);
  }
}
