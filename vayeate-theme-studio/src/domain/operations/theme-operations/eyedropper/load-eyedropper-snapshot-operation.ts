import { injectable } from 'tsyringe';
import type { ScreenshotFullDisplaySnapshot } from '../../../../gateway/services/screenshot-service';
import { ScreenshotService } from '../../../../gateway/services/screenshot-service';
import type { EyedropperSnapshotPayload } from '../../../state/eyedropper-ui-state';
import { UiStateSetter } from '../../../state/ui-state-setter';

/** IPC may deliver Buffer, Uint8Array, ArrayBuffer, or Node-style `{ type, data }` depending on clone path. */
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

/** Fetch full-display PNG snapshot via main process and store in `ui.eyedropper` as `ready` or `error`. */
@injectable()
export class LoadEyedropperSnapshotOperation {
  constructor(
    private readonly uiStateSetter: UiStateSetter,
    private readonly screenshotService: ScreenshotService,
  ) {}

  async execute(contextKey: string): Promise<void> {
    try {
      const raw = await this.screenshotService.getFullDisplaySnapshot();
      const snapshot = mapToPayload(raw);
      this.uiStateSetter.apply({
        type: 'SET_UI_EYEDROPPER',
        eyedropper: {
          phase: 'ready',
          contextKey,
          snapshot,
          errorMessage: null,
        },
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.uiStateSetter.apply({
        type: 'SET_UI_EYEDROPPER',
        eyedropper: {
          phase: 'error',
          contextKey,
          snapshot: null,
          errorMessage: message,
        },
      });
    }
  }
}
