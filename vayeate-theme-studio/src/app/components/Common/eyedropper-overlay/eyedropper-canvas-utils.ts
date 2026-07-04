import type { EyedropperDisplaySnapshotEntry } from '../../../../model/Common/eyedropper';
import type { Point, Size } from '../../../../model/Common/point';
import { ZERO_POINT } from '../../../../model/Common/point';
import type { Rect } from '../../../../model/Common/rect';
import type { HexColor } from '../../../../model/Common/schema/primitives';

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
