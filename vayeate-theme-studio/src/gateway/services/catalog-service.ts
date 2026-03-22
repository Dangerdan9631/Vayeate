import { singleton } from 'tsyringe';

@singleton()
export class CatalogService {
  private getAPI() {
    const api = window.electronAPI;
    if (!api) {
      throw new Error('Electron API not available. Run the app in Electron.');
    }
    return api;
  }

  async fetchUrl(url: string): Promise<string> {
    const text = await this.getAPI().fetchUrl(url);
    return text;
  }
}
