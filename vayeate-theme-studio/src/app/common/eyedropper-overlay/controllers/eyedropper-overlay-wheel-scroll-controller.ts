import { singleton } from 'tsyringe';
import { UpdateEyedropperZoomOperation } from '../../../../domain/operations/eyedropper-operations/update-eyedropper-zoom-operation';
import { EyedropperUiStore } from '../../../../domain/state/ui/eyedropper-ui-store';
import { clampEyedropperZoomToFitRange, EYEDROPPER_ZOOM_STEP, eyedropperZoomFitContain } from '../eyedropper-utils';

/**
 * Applies wheel-driven zoom changes for the eyedropper overlay canvas.
 */
@singleton()
export class EyedropperOverlayWheelScrollController {
  constructor(
    private readonly updateEyedropperZoomOperation: UpdateEyedropperZoomOperation,
    private readonly eyedropperUiStore: EyedropperUiStore,
  ) {}

  /**
   * Steps zoom in or out relative to the current contain-fit scale and clamps to allowed range.
   * @param deltaY Wheel delta from the overlay scroll event.
   * @returns A promise that settles when zoom state is updated, if a change applies.
   */
  async run(deltaY: number): Promise<void> {
    const state = this.eyedropperUiStore.getStore().state;
    const currentZoom = state.zoom;
    const snapshot = state.snapshot;

    if (!snapshot) return;

    const zoomFit = eyedropperZoomFitContain(
      state.overlayViewportSize.width,
      state.overlayViewportSize.height,
      snapshot.fullBounds.width,
      snapshot.fullBounds.height,
    );
    if (zoomFit <= 0) return;

    const newZoom = clampEyedropperZoomToFitRange(
      currentZoom * (deltaY < 0 ? EYEDROPPER_ZOOM_STEP : 1 / EYEDROPPER_ZOOM_STEP),
      zoomFit,
    );

    if (Math.abs(newZoom - currentZoom) < 1e-9) return;

    this.updateEyedropperZoomOperation.execute(newZoom);
  }
}
