import { singleton } from 'tsyringe';

/**
 * Renderer facade for generating and launching the VS Code theme preview extension host.
 */
@singleton()
export class ThemePreviewHostService {
  /**
   * Builds the live preview extension and launches a VS Code extension host window.
   *
   * @param displayName - Current selected theme name used in extension metadata.
   */
  async open(displayName: string): Promise<void> {
    const api = window.electronAPI;
    if (!api) {
      throw new Error('Electron API not available. Run the app in Electron.');
    }

    await api.openThemePreviewHost({ displayName });
  }
}
