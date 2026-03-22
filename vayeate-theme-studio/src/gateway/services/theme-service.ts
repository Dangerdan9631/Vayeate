import { singleton } from 'tsyringe';

@singleton()
export class ThemeService {
  private getAPI() {
    const api = window.electronAPI;
    if (!api) {
      throw new Error('Electron API not available. Run the app in Electron.');
    }
    return api;
  }

  async generateTheme(
    themeName: string,
    themeVersion: string,
    templateName: string,
    templateVersion: string,
  ): Promise<{ darkPath: string; lightPath: string }> {
    const result = await this.getAPI().generateTheme(
      themeName,
      themeVersion,
      templateName,
      templateVersion,
    );
    return result;
  }
}
