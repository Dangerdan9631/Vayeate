import { singleton } from 'tsyringe';
import type { TokenizedPreview } from '../../model/preview-types';

@singleton()
export class PreviewService {
  private getAPI() {
    const api = window.electronAPI;
    if (!api) {
      throw new Error('Electron API not available. Run the app in Electron.');
    }
    return api;
  }

  async loadPreviews(): Promise<TokenizedPreview[]> {
    const previews = await this.getAPI().loadPreviews();
    return previews;
  }
}
