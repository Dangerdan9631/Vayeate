import type { TokenizedPreview } from '../core/tokenizer';
import { createLogger } from '../utils/logger';

const log = createLogger('PreviewService');

function getAPI() {
  const api = window.electronAPI;
  if (!api) {
    throw new Error('Electron API not available. Run the app in Electron.');
  }
  return api;
}

export const previewService = {
  loadPreviews: async (): Promise<TokenizedPreview[]> => {
    log.debug('IPC preview:loadAll');
    const previews = await getAPI().loadPreviews();
    log.debug('IPC preview:loadAll →', previews.length, 'preview(s)');
    return previews;
  },
};
