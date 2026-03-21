import { singleton } from 'tsyringe';

@singleton()
export class ConfigService {
  private getAPI() {
    const api = window.electronAPI;
    if (!api) {
      throw new Error('Electron API not available. Run the app in Electron.');
    }
    return api;
  }

  async save(config: { colorScheme: 'light' | 'dark' }): Promise<void> {
    await this.getAPI().saveConfig?.(config);
  }
}
