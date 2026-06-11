import type { EyedropperDisplaySnapshotEntry } from '../../../model/eyedropper';
import type { Point, Size } from '../../../model/point';
import { ZERO_POINT } from '../../../model/point';
import type { Rect } from '../../../model/rect';
import type { HexColor } from '../../../model/schema/primitives';

/**
 * Loupe canvas edge length in CSS pixels.
 */
export const EYEDROPPER_LOUPE_SIZE = 120;

/**
 * Source pixel radius on each side of the loupe center; side length is `2 * radius + 1`.
 */
export const EYEDROPPER_LOUPE_PIXEL_RADIUS = 10;

/**
 * Maximum zoom multiplier relative to the contain-fit scale.
 */
export const EYEDROPPER_ZOOM_MAX = 8;

/**
 * Per-wheel-step zoom multiplier applied before clamping to the fit range.
 */
export const EYEDROPPER_ZOOM_STEP = 1.1;

/**
 * Converts RGB channel values to a normalized hex color string.
 * @param r Red channel (0–255).
 * @param g Green channel (0–255).
 * @param b Blue channel (0–255).
 * @returns Hex color including leading `#`.
 */
export function rgbToHex(r: number, g: number, b: number): HexColor {
  const pad = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${pad(r)}${pad(g)}${pad(b)}`;
}

/**
 * Reads one canvas pixel and returns its color as hex.
 * @param canvas Snapshot canvas element.
 * @param position Bitmap pixel coordinates.
 * @returns Sampled hex color, or null when the 2D context is unavailable.
 */
export function getCanvasColor(canvas: HTMLCanvasElement, position: Point): HexColor | null {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  const [r, g, b] = ctx.getImageData(position.x, position.y, 1, 1).data;
  return rgbToHex(r, g, b);
}

/**
 * Paints all display bitmaps from a snapshot into the eyedropper canvas.
 * @param canvas Target canvas element.
 * @param snapshotBounds Full snapshot bounding rect in screen space.
 * @param snapshot Per-display bitmap entries relative to the snapshot bounds.
 * @returns A promise that settles when drawing completes.
 */
export async function loadSnapshotToCanvas(
  canvas: HTMLCanvasElement,
  snapshotBounds: Rect,
  snapshot: EyedropperDisplaySnapshotEntry[],
): Promise<void> {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;
  ctx.clearRect(0, 0, snapshotBounds.width, snapshotBounds.height);
  for (const d of snapshot) {
    ctx.drawImage(
      d.bitmap,
      d.bounds.x - snapshotBounds.x,
      d.bounds.y - snapshotBounds.y,
      d.bounds.width,
      d.bounds.height,
    );
  }
}

/**
 * Maps a client-space point to floored bitmap pixel coordinates inside the canvas.
 * @param clientPosition Pointer position in viewport client coordinates.
 * @param canvas Canvas element used for layout and bitmap sizing.
 * @returns Clamped pixel coordinates, or null when the point lies outside the canvas element.
 */
export function clientToCanvasPixel(
  clientPosition: Point,
  canvas: HTMLCanvasElement
): Point | null {
  const rect = canvas.getBoundingClientRect();
  const nx = (clientPosition.x - rect.left) / rect.width;
  const ny = (clientPosition.y - rect.top) / rect.height;
  if (nx < 0 || nx >= 1 || ny < 0 || ny >= 1) return null;
  const px = Math.floor(nx * canvas.width);
  const py = Math.floor(ny * canvas.height);
  const clampedX = Math.max(0, Math.min(canvas.width - 1, px));
  const clampedY = Math.max(0, Math.min(canvas.height - 1, py));
  return { x: clampedX, y: clampedY };
}

/**
 * Maps a client-space point to continuous bitmap coordinates for zoom anchoring.
 * @param clientX Pointer x in viewport client coordinates.
 * @param clientY Pointer y in viewport client coordinates.
 * @param canvas Canvas or other element providing layout bounds.
 * @param canvasWidth Bitmap width in pixels.
 * @param canvasHeight Bitmap height in pixels.
 * @returns Bitmap coordinates, or null when the point lies outside the element.
 */
export function clientToCanvasFloat(
  clientX: number,
  clientY: number,
  canvas: HTMLElement,
  canvasWidth: number,
  canvasHeight: number,
): Point | null {
  const rect = canvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  const nx = (clientX - rect.left) / rect.width;
  const ny = (clientY - rect.top) / rect.height;
  if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return null;
  return { x: nx * canvasWidth, y: ny * canvasHeight };
}

/**
 * Maps a client point to bitmap coordinates, clamping to the canvas rect first.
 * Use when the cursor may sit in scroll padding outside the image during wheel zoom.
 * @param clientX Pointer x in viewport client coordinates.
 * @param clientY Pointer y in viewport client coordinates.
 * @param canvas Canvas or other element providing layout bounds.
 * @param canvasWidth Bitmap width in pixels.
 * @param canvasHeight Bitmap height in pixels.
 * @returns Clamped bitmap coordinates, or null when layout size is invalid.
 */
export function clientToCanvasFloatClamped(
  clientX: number,
  clientY: number,
  canvas: HTMLElement,
  canvasWidth: number,
  canvasHeight: number,
): Point | null {
  const rect = canvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  const cx = Math.min(Math.max(clientX, rect.left), rect.right);
  const cy = Math.min(Math.max(clientY, rect.top), rect.bottom);
  return clientToCanvasFloat(cx, cy, canvas, canvasWidth, canvasHeight);
}

/**
 * Clamps scroll offsets so content cannot scroll past its bounds.
 * @param el Scrollable HTML element to correct in place.
 * @returns Nothing.
 */
export function clampElementScroll(el: HTMLElement): void {
  const maxL = Math.max(0, el.scrollWidth - el.clientWidth);
  const maxT = Math.max(0, el.scrollHeight - el.clientHeight);
  el.scrollLeft = Math.max(0, Math.min(maxL, el.scrollLeft));
  el.scrollTop = Math.max(0, Math.min(maxT, el.scrollTop));
}

/**
 * Returns the content-box width and height inside an element's padding.
 * @param el Scroll container element with optional CSS padding.
 * @returns Inner content dimensions used for contain and aspect calculations.
 */
export function scrollContainerContentSize(el: HTMLElement): Size {
  const cs = getComputedStyle(el);
  const pl = parseFloat(cs.paddingLeft) || 0;
  const pr = parseFloat(cs.paddingRight) || 0;
  const pt = parseFloat(cs.paddingTop) || 0;
  const pb = parseFloat(cs.paddingBottom) || 0;
  return {
    width: Math.max(0, el.clientWidth - pl - pr),
    height: Math.max(0, el.clientHeight - pt - pb),
  };
}

/**
 * Computes the largest centered contain rectangle matching bitmap aspect inside inner bounds.
 * @param innerW Scroll content inner width.
 * @param innerH Scroll content inner height.
 * @param bitmapW Snapshot bitmap width.
 * @param bitmapH Snapshot bitmap height.
 * @returns Contain rectangle width and height as `{ x, y }`, or zero when inputs are invalid.
 */
export function eyedropperAspectContainRect(
  innerW: number,
  innerH: number,
  bitmapW: number,
  bitmapH: number,
): Point {
  if (innerW <= 0 || innerH <= 0 || bitmapW <= 0 || bitmapH <= 0) {
    return ZERO_POINT;
  }
  const Rw = Math.min(innerW, (innerH * bitmapW) / bitmapH);
  const Rh = Math.min(innerH, (innerW * bitmapH) / bitmapW);
  return { x: Rw, y: Rh };
}

/**
 * Keeps canvas edges inside the centered contain rectangle within the scroll content area.
 * Does not force centering when the image is smaller than that rectangle.
 * @param scrollEl Scroll container element.
 * @param canvas Canvas element whose screen position is constrained.
 * @param bitmapW Snapshot bitmap width.
 * @param bitmapH Snapshot bitmap height.
 * @returns Nothing.
 */
export function clampEyedropperCanvasInAspectBounds(
  scrollEl: HTMLElement,
  canvas: HTMLElement,
  bitmapW: number,
  bitmapH: number,
): void {
  if (bitmapW <= 0 || bitmapH <= 0) return;
  const { width: innerW, height: innerH } = scrollContainerContentSize(scrollEl);
  if (innerW <= 0 || innerH <= 0) return;

  const { x: Rw, y: Rh } = eyedropperAspectContainRect(innerW, innerH, bitmapW, bitmapH);
  if (Rw <= 0 || Rh <= 0) return;
  const cs = getComputedStyle(scrollEl);
  const pl = parseFloat(cs.paddingLeft) || 0;
  const pt = parseFloat(cs.paddingTop) || 0;
  const sr = scrollEl.getBoundingClientRect();
  const Rleft = sr.left + scrollEl.clientLeft + pl + (innerW - Rw) / 2;
  const Rtop = sr.top + scrollEl.clientTop + pt + (innerH - Rh) / 2;

  for (let i = 0; i < 8; i++) {
    const cr = canvas.getBoundingClientRect();
    const cw = cr.width;
    const ch = cr.height;
    const minL = Math.min(Rleft, Rleft + Rw - cw);
    const maxL = Math.max(Rleft, Rleft + Rw - cw);
    const minT = Math.min(Rtop, Rtop + Rh - ch);
    const maxT = Math.max(Rtop, Rtop + Rh - ch);

    let dl = 0;
    let dt = 0;
    if (cr.left < minL - 0.25) dl = minL - cr.left;
    else if (cr.left > maxL + 0.25) dl = maxL - cr.left;
    if (cr.top < minT - 0.25) dt = minT - cr.top;
    else if (cr.top > maxT + 0.25) dt = maxT - cr.top;

    if (Math.abs(dl) < 1e-4 && Math.abs(dt) < 1e-4) break;
    scrollEl.scrollLeft += dl;
    scrollEl.scrollTop += dt;
  }
  clampElementScroll(scrollEl);
}

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
