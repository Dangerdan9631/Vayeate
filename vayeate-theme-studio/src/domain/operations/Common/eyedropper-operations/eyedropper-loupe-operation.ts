import { singleton } from 'tsyringe';

/**
 * Loupe canvas edge length in CSS pixels.
 */
export const EYEDROPPER_LOUPE_SIZE = 120;

/**
 * Source pixel radius on each side of the loupe center; side length is `2 * radius + 1`.
 */
export const EYEDROPPER_LOUPE_PIXEL_RADIUS = 10;

/**
 * Returns a clamped source rectangle in canvas pixel space for loupe sampling.
 * @param px Cursor x in bitmap pixels.
 * @param py Cursor y in bitmap pixels.
 * @param radius Pixel radius on each side of center.
 * @param canvasWidth Canvas bitmap width.
 * @param canvasHeight Canvas bitmap height.
 * @returns Source rect `{ sx, sy, sw, sh }` for `drawImage` or `getImageData`.
 */
export function loupeSourceRect(
  px: number,
  py: number,
  radius: number,
  canvasWidth: number,
  canvasHeight: number,
): { sx: number; sy: number; sw: number; sh: number } {
  const side = radius * 2 + 1;
  let sx = px - radius;
  let sy = py - radius;
  if (sx < 0) sx = 0;
  if (sy < 0) sy = 0;
  if (sx + side > canvasWidth) sx = Math.max(0, canvasWidth - side);
  if (sy + side > canvasHeight) sy = Math.max(0, canvasHeight - side);
  const sw = Math.min(side, canvasWidth - sx);
  const sh = Math.min(side, canvasHeight - sy);
  return { sx, sy, sw, sh };
}

/**
 * Positions the fixed loupe near the cursor while keeping it on screen.
 * @param clientX Pointer x in viewport client coordinates.
 * @param clientY Pointer y in viewport client coordinates.
 * @param loupeSize Loupe edge length in CSS pixels.
 * @param viewportW App viewport width.
 * @param viewportH App viewport height.
 * @returns Screen `left` and `top` offsets for the loupe element.
 */
export function loupeFixedPosition(
  clientX: number,
  clientY: number,
  loupeSize: number,
  viewportW: number,
  viewportH: number,
): { left: number; top: number } {
  const gap = 16;
  let left = clientX + gap;
  let top = clientY + gap;
  if (left + loupeSize > viewportW - 8) left = clientX - loupeSize - gap;
  if (top + loupeSize > viewportH - 8) top = clientY - loupeSize - gap;
  const pad = 8;
  left = Math.max(pad, Math.min(left, viewportW - loupeSize - pad));
  top = Math.max(pad, Math.min(top, viewportH - loupeSize - pad));
  return { left, top };
}

/**
 * Maps the sampled cursor pixel to crosshair center coordinates in the loupe canvas.
 * @param cursorPx Cursor x in bitmap pixels.
 * @param cursorPy Cursor y in bitmap pixels.
 * @param sx Source rect x from `loupeSourceRect`.
 * @param sy Source rect y from `loupeSourceRect`.
 * @param sw Sampled region width.
 * @param sh Sampled region height.
 * @param loupeSize Loupe canvas edge length.
 * @returns Crosshair center `{ cx, cy }` in loupe canvas coordinates.
 */
export function loupeCrosshairCenter(
  cursorPx: number,
  cursorPy: number,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  loupeSize: number,
): { cx: number; cy: number } {
  const cx = (cursorPx - sx + 0.5) * (loupeSize / sw);
  const cy = (cursorPy - sy + 0.5) * (loupeSize / sh);
  return { cx, cy };
}

/**
 * Operation wrapper for eyedropper loupe geometry helpers.
 */
@singleton()
export class EyedropperLoupeOperation {}
