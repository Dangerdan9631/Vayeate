import { singleton } from 'tsyringe';
import type { Size } from '../../../../model/point';
import { SetEyedropperOverlayViewportSizeOperation } from '../../../../domain/operations/eyedropper-operations/set-eyedropper-overlay-viewport-size-operation';
import { UpdateEyedropperZoomOperation } from '../../../../domain/operations/eyedropper-operations/update-eyedropper-zoom-operation';
import { EyedropperUiStore } from '../../../../domain/state/ui/eyedropper-ui-store';
import { clampEyedropperZoomToFitRange, eyedropperZoomFitContain } from '../eyedropper-utils';

@singleton()
export class EyedropperOverlayViewportSizeChangeController {
  constructor(
    private readonly setEyedropperOverlayViewportSize: SetEyedropperOverlayViewportSizeOperation,
    private readonly updateEyedropperZoom: UpdateEyedropperZoomOperation,
    private readonly eyedropperUiStore: EyedropperUiStore,
  ) {}

  async run(size: Size): Promise<void> {
    const previousState = this.eyedropperUiStore.getStore().state;
    const previousViewportSize = previousState.overlayViewportSize;
    this.setEyedropperOverlayViewportSize.execute(size);

    const state = this.eyedropperUiStore.getStore().state;
    const snapshotBounds = state.snapshot?.fullBounds;
    if (!snapshotBounds) return;

    const zoomFit = eyedropperZoomFitContain(
      size.width,
      size.height,
      snapshotBounds.width,
      snapshotBounds.height,
    );
    if (zoomFit <= 0) return;

    const hasPreviousViewportSize = previousViewportSize.width > 0 && previousViewportSize.height > 0;
    const nextZoom = hasPreviousViewportSize
      ? clampEyedropperZoomToFitRange(state.zoom, zoomFit)
      : zoomFit;

    if (Math.abs(nextZoom - state.zoom) > 1e-9) {
      this.updateEyedropperZoom.execute(nextZoom);
    }
  }
}
