import { singleton } from 'tsyringe';
import type { ScreenshotFullDisplaySnapshot } from '../../../../gateway/services/screenshot-service-types';
import { ScreenshotService } from '../../../../gateway/services/screenshot-service';
import type { EyedropperSnapshotPayload } from '../../../state/ui/eyedropper-ui-state';
import { EnqueueBackgroundQueueActionOperation } from '../../background-queue/enqueue-background-queue-action-operation';
import { EyedropperUiStore } from '../../../state/ui/eyedropper-ui-store';

function pngToUint8Array(png: unknown): Uint8Array {
  if (png instanceof Uint8Array) return png;
  if (png instanceof ArrayBuffer) return new Uint8Array(png);
  if (ArrayBuffer.isView(png)) {
    return new Uint8Array(png.buffer, png.byteOffset, png.byteLength);
  }
  if (Array.isArray(png)) return new Uint8Array(png);
  if (png && typeof png === 'object' && 'data' in png && Array.isArray((png as { data: unknown }).data)) {
    return new Uint8Array((png as { data: number[] }).data);
  }
  throw new Error('Unexpected PNG payload shape from screenshot snapshot');
}

function mapToPayload(raw: ScreenshotFullDisplaySnapshot): EyedropperSnapshotPayload {
  return {
    fullBounds: raw.fullBounds,
    displays: raw.displays.map((d) => ({
      sourceId: d.sourceId,
      x: d.x,
      y: d.y,
      width: d.width,
      height: d.height,
      png: pngToUint8Array(d.png),
    })),
  };
}

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
      async () => {
        try {
          const raw = await this.screenshotService.getFullDisplaySnapshot();
          const snapshot = mapToPayload(raw);
          this.eyedropperUiStore.getStore().updateEyedropperSnapshot(snapshot);
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          this.eyedropperUiStore.getStore().setEyedropperErrorMessage(message);
        }
      }
    );
  }
}
