import type { TokenizedPreview } from '../../model/preview-types';

function getAPI() {
  const api = window.electronAPI;
  if (!api) {
    throw new Error('Electron API not available. Run the app in Electron.');
  }
  return api;
}

export const previewService = {
  loadPreviews: async (): Promise<TokenizedPreview[]> => {
    const previews = await getAPI().loadPreviews();
    return previews;
  },
};
