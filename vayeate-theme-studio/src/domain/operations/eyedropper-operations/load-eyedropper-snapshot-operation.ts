import { singleton } from 'tsyringe';
import { ScreenshotService } from '../../../gateway/services/screenshot-service';
import { EyedropperUiStore } from '../../state/ui/eyedropper-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../background-queue/enqueue-background-queue-action-operation';

@singleton()
export class LoadEyedropperSnapshotOperation {
  constructor(
    private readonly eyedropperUiStore: EyedropperUiStore,
    private readonly screenshotService: ScreenshotService,
    private readonly enqueueBackgroundAction: EnqueueBackgroundQueueActionOperation,
  ) {}

  execute(): void {
    this.enqueueBackgroundAction.execute(
      'Loading eyedropper snapshot',
      async (): Promise<void> => {
        try {
          const raw = await this.screenshotService.getFullDisplaySnapshot();

          const fullBounds = raw.fullBounds;
          const displays = [];
          for (const d of raw.displays) {
            const bytes = new Uint8Array(d.png);
            if (bytes.byteLength === 0) continue;

            const blob = new Blob([bytes], { type: 'image/png' });
            const bmp = await createImageBitmap(blob);
            displays.push({
              sourceId: d.sourceId,
              x: d.x,
              y: d.y,
              width: d.width,
              height: d.height,
              bmp,
            });
          }

          this.eyedropperUiStore.getStore().updateEyedropperSnapshot({ fullBounds, displays });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          this.eyedropperUiStore.getStore().setEyedropperErrorMessage(message);
        }
      }
    );
  }
}
