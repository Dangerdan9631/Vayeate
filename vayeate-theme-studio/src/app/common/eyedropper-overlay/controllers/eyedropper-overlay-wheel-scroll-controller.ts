import { singleton } from 'tsyringe';
import { UpdateEyedropperZoomOperation } from '../../../../domain/operations/eyedropper-operations/update-eyedropper-zoom-operation';
import { EyedropperUiStore } from '../../../../domain/state/ui/eyedropper-ui-store';
import { clampEyedropperZoomToFitRange, EYEDROPPER_ZOOM_STEP } from '../eyedropper-utils';

@singleton()
export class EyedropperOverlayWheelScrollController {
  constructor(
    private readonly updateEyedropperZoomOperation: UpdateEyedropperZoomOperation,
    private readonly eyedropperUiStore: EyedropperUiStore,
  ) {}

  run(delta: number): void {
    const state = this.eyedropperUiStore.getStore().state;
    const currentZoom = state.zoom;
    const snapshot = state.snapshot;
    
    if (!snapshot) return;
    
    const zoomFit = this.calculateZoomFit(snapshot.fullBounds.width, snapshot.fullBounds.height);
    if (zoomFit <= 0) return;
    
    const newZoom = clampEyedropperZoomToFitRange(
      currentZoom * (delta < 0 ? EYEDROPPER_ZOOM_STEP : 1 / EYEDROPPER_ZOOM_STEP),
      zoomFit,
    );
    
    if (Math.abs(newZoom - currentZoom) < 1e-9) return;
    
    this.updateEyedropperZoomOperation.execute(newZoom);
  }

  private calculateZoomFit(bitmapWidth: number, bitmapHeight: number): number {
    const viewport = this.eyedropperUiStore.getStore().state.overlayViewportSize;
    if (viewport.width <= 0 || viewport.height <= 0 || bitmapWidth <= 0 || bitmapHeight <= 0) {
      return 0;
    }
    return Math.min(viewport.width / bitmapWidth, viewport.height / bitmapHeight);
  }
}
