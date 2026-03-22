import { singleton } from 'tsyringe';

export type ScreenSourcesWithBounds = {
  sources: Array<{ sourceId: string; x: number; y: number; width: number; height: number }>;
  fullBounds: { x: number; y: number; width: number; height: number };
};

export type ScreenSourceProvider = () => Promise<ScreenSourcesWithBounds>;

@singleton()
export class EyedropperService {
  isAvailable(): boolean {
    return Boolean(window.electronAPI?.eyedropperGetScreenSourcesWithBounds);
  }

  async getScreenSourcesWithBounds(): Promise<ScreenSourcesWithBounds> {
    const api = window.electronAPI?.eyedropperGetScreenSourcesWithBounds;
    if (!api) {
      throw new Error('Electron eyedropper API is not available.');
    }
    return api();
  }
}
