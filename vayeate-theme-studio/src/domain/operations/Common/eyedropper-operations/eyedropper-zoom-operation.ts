import { singleton } from 'tsyringe';

/**
 * Maximum zoom multiplier relative to the contain-fit scale.
 */
export const EYEDROPPER_ZOOM_MAX = 8;

/**
 * Per-wheel-step zoom multiplier applied before clamping to the fit range.
 */
export const EYEDROPPER_ZOOM_STEP = 1.1;

/**
 * Computes the CSS scale that fits the full bitmap inside the viewport (object-fit: contain).
 * @param viewportW Available viewport width.
 * @param viewportH Available viewport height.
 * @param bitmapW Snapshot bitmap width.
 * @param bitmapH Snapshot bitmap height.
 * @returns Contain-fit scale, or zero when dimensions are invalid.
 */
export function eyedropperZoomFitContain(
  viewportW: number,
  viewportH: number,
  bitmapW: number,
  bitmapH: number,
): number {
  if (viewportW <= 0 || viewportH <= 0 || bitmapW <= 0 || bitmapH <= 0) return 0;
  return Math.min(viewportW / bitmapW, viewportH / bitmapH);
}

/**
 * Clamps absolute zoom relative to the contain-fit scale.
 * Minimum is exactly `zFit`; maximum is `zFit * EYEDROPPER_ZOOM_MAX`.
 * @param z Requested absolute zoom scale.
 * @param zFit Contain-fit baseline scale for the current viewport.
 * @returns Clamped zoom scale.
 */
export function clampEyedropperZoomToFitRange(z: number, zFit: number): number {
  if (zFit <= 0) return z;
  const min = zFit;
  const max = zFit * EYEDROPPER_ZOOM_MAX;
  return Math.max(min, Math.min(max, z));
}

/**
 * Operation wrapper for eyedropper zoom math helpers.
 */
@singleton()
export class EyedropperZoomOperation {}
