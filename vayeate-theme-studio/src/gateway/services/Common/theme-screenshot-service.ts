import { singleton } from 'tsyringe';
import type {
  ThemeScreenshotRequest,
  ThemeScreenshotResult,
} from '../../../model/Theme/theme-build';

/**
 * Renderer facade for VS Code Extension Development Host screenshots through Electron IPC.
 */
@singleton()
export class ThemeScreenshotService {
  /**
   * Captures all supplied generated theme variants to their requested output paths.
   */
  async generateAll(
    requests: readonly ThemeScreenshotRequest[],
  ): Promise<ThemeScreenshotResult[]> {
    const api = window.electronAPI;
    if (!api) {
      throw new Error('Electron API not available. Run the app in Electron.');
    }
    return api.generateThemeScreenshots(requests);
  }
}
