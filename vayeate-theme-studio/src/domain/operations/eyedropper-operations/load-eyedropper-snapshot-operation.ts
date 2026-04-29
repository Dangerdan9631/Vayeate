import { singleton } from 'tsyringe';
import { ScreenshotService } from '../../../gateway/services/screenshot-service';
import type { EyedropperDisplaySnapshotEntry } from '../../../model/eyedropper';
import { EyedropperUiStore } from '../../state/ui/eyedropper-ui-store';

@singleton()
export class LoadEyedropperSnapshotOperation {
  constructor(
    private readonly eyedropperUiStore: EyedropperUiStore,
    private readonly screenshotService: ScreenshotService,
  ) {}

  async execute(): Promise<void> {
    try {
      const raw = await this.screenshotService.getFullDisplaySnapshot();

      const fullBounds = raw.fullBounds;
      const displays: EyedropperDisplaySnapshotEntry[] = [];
      for (const d of raw.displays) {
        const bytes = new Uint8Array(d.png);
        if (bytes.byteLength === 0) continue;

        const blob = new Blob([bytes], { type: 'image/png' });
        const bitmap = await createImageBitmap(blob);
        displays.push({
          sourceId: d.sourceId,
          bounds: d.bounds,
          bitmap,
        });
      }

      this.eyedropperUiStore.getStore().updateEyedropperSnapshot({ fullBounds, displays });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.eyedropperUiStore.getStore().setEyedropperErrorMessage(message);
    }
  }
}
