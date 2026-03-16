export type ScreenSourcesWithBounds = {
  sources: Array<{ sourceId: string; x: number; y: number; width: number; height: number }>;
  fullBounds: { x: number; y: number; width: number; height: number };
};

export type ScreenSourceProvider = () => Promise<ScreenSourcesWithBounds>;

export function isElectronEyedropperAvailable(): boolean {
  return Boolean(window.electronAPI?.eyedropperGetScreenSourcesWithBounds);
}

export const getScreenSourcesWithBounds: ScreenSourceProvider = async () => {
  const api = window.electronAPI?.eyedropperGetScreenSourcesWithBounds;
  if (!api) {
    throw new Error('Electron eyedropper API is not available.');
  }
  return api();
};
