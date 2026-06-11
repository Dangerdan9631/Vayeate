import { singleton } from 'tsyringe';
import { ScreenshotService } from '../../../gateway/services/screenshot-service';
import type { EyedropperDisplaySnapshotEntry } from '../../../model/eyedropper';
import { EyedropperUiStore } from '../../state/ui/eyedropper-ui-store';
import { EnqueueBackgroundQueueActionOperation } from '../background-queue/enqueue-background-queue-action-operation';

/**
 * Loads eyedropper snapshot from persistence into the store.
 */

@singleton()
export class LoadEyedropperSnapshotOperation {
  constructor(
    private readonly eyedropperUiStore: EyedropperUiStore,
    private readonly screenshotService: ScreenshotService,
    private readonly enqueueBackgroundQueue: EnqueueBackgroundQueueActionOperation,
  ) {}

  /**
   * Runs the load eyedropper snapshot mutation.
   * @returns Nothing; updates store or invokes a gateway side effect.
   */

  execute(): void {
    this.enqueueBackgroundQueue.execute(
      'worker',
      'Capturing desktop snapshot for eyedropper',
      async () => {
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
      },
    );
  }
}
