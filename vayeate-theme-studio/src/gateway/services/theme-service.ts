import { singleton } from 'tsyringe';
import type { Theme } from '../../model/schemas';

@singleton()
export class ThemeService {
  private getAPI() {
    const api = window.electronAPI;
    if (!api) {
      throw new Error('Electron API not available. Run the app in Electron.');
    }
    return api;
  }

  async createTheme(params: { name: string }): Promise<Theme> {
    const theme = await this.getAPI().createTheme(params);
    return theme;
  }

  async saveTheme(theme: Theme): Promise<void> {
    await this.getAPI().saveTheme(theme);
  }

  async loadTheme(name: string, version: string): Promise<Theme | null> {
    const theme = await this.getAPI().loadTheme(name, version);
    return theme;
  }

  async listThemes() {
    const refs = await this.getAPI().listThemes();
    return refs;
  }

  async deleteTheme(name: string, version: string): Promise<void> {
    await this.getAPI().deleteTheme(name, version);
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
