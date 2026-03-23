/**
 * Helpers for the Electron full-screen eyedropper overlay (`EyedropperOverlay` + `ScreenshotService`).
 */

export function isEyedropperSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof window.electronAPI?.screenshotGetFullDisplaySnapshot === 'function';
}

export function rgbToHex(r: number, g: number, b: number): string {
  const pad = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${pad(r)}${pad(g)}${pad(b)}`;
}

/** Map (clientX, clientY) to canvas pixel (px, py) using wrapper rect; returns null if out of bounds. */
export function clientToCanvasPixel(
  clientX: number,
  clientY: number,
  wrapper: HTMLElement,
  canvasWidth: number,
  canvasHeight: number,
): { px: number; py: number } | null {
  const rect = wrapper.getBoundingClientRect();
  const nx = (clientX - rect.left) / rect.width;
  const ny = (clientY - rect.top) / rect.height;
  if (nx < 0 || nx >= 1 || ny < 0 || ny >= 1) return null;
  const px = Math.floor(nx * canvasWidth);
  const py = Math.floor(ny * canvasHeight);
  const clampedX = Math.max(0, Math.min(canvasWidth - 1, px));
  const clampedY = Math.max(0, Math.min(canvasHeight - 1, py));
  return { px: clampedX, py: clampedY };
}

/** Continuous bitmap coordinates (for zoom anchoring). Returns null if outside the canvas element. */
export function clientToCanvasFloat(
  clientX: number,
  clientY: number,
  canvas: HTMLElement,
  canvasWidth: number,
  canvasHeight: number,
): { fx: number; fy: number } | null {
  const rect = canvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  const nx = (clientX - rect.left) / rect.width;
  const ny = (clientY - rect.top) / rect.height;
  if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return null;
  return { fx: nx * canvasWidth, fy: ny * canvasHeight };
}

/**
 * Bitmap coordinates for zoom anchoring: clamps the client point to the canvas rect, then maps
 * linearly (same as `clientToCanvasFloat` for points on the canvas). Use for wheel zoom when the
 * cursor may be in scroll padding outside the image.
 */
export function clientToCanvasFloatClamped(
  clientX: number,
  clientY: number,
  canvas: HTMLElement,
  canvasWidth: number,
  canvasHeight: number,
): { fx: number; fy: number } | null {
  const rect = canvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  const cx = Math.min(Math.max(clientX, rect.left), rect.right);
  const cy = Math.min(Math.max(clientY, rect.top), rect.bottom);
  const nx = (cx - rect.left) / rect.width;
  const ny = (cy - rect.top) / rect.height;
  return { fx: nx * canvasWidth, fy: ny * canvasHeight };
}

/** Clamp scroll offsets so the scrollable area does not exceed content bounds. */
export function clampElementScroll(el: HTMLElement): void {
  const maxL = Math.max(0, el.scrollWidth - el.clientWidth);
  const maxT = Math.max(0, el.scrollHeight - el.clientHeight);
  el.scrollLeft = Math.max(0, Math.min(maxL, el.scrollLeft));
  el.scrollTop = Math.max(0, Math.min(maxT, el.scrollTop));
}

/** Content-box width/height inside padding (for contain + aspect bounds). */
export function scrollContainerContentSize(el: HTMLElement): { w: number; h: number } {
  const cs = getComputedStyle(el);
  const pl = parseFloat(cs.paddingLeft) || 0;
  const pr = parseFloat(cs.paddingRight) || 0;
  const pt = parseFloat(cs.paddingTop) || 0;
  const pb = parseFloat(cs.paddingBottom) || 0;
  return {
    w: Math.max(0, el.clientWidth - pl - pr),
    h: Math.max(0, el.clientHeight - pt - pb),
  };
}

/**
 * Width and height of the centered aspect “contain” rectangle inside the scroll content area
 * (same aspect as the bitmap; the largest such rect that fits in `innerW` × `innerH`).
 */
export function eyedropperAspectContainRect(
  innerW: number,
  innerH: number,
  bitmapW: number,
  bitmapH: number,
): { Rw: number; Rh: number } {
  if (innerW <= 0 || innerH <= 0 || bitmapW <= 0 || bitmapH <= 0) {
    return { Rw: 0, Rh: 0 };
  }
  const Rw = Math.min(innerW, (innerH * bitmapW) / bitmapH);
  const Rh = Math.min(innerH, (innerW * bitmapH) / bitmapW);
  return { Rw, Rh };
}

/**
 * Keeps the canvas edges inside the centered “contain” rect (same aspect as the bitmap) in the
 * scroll container’s **content** area. Does not force centering when the image is smaller than
 * that rect—only prevents each edge from crossing past the matching edge of R.
 */
export function clampEyedropperCanvasInAspectBounds(
  scrollEl: HTMLElement,
  canvas: HTMLElement,
  bitmapW: number,
  bitmapH: number,
): void {
  if (bitmapW <= 0 || bitmapH <= 0) return;
  const { w: innerW, h: innerH } = scrollContainerContentSize(scrollEl);
  if (innerW <= 0 || innerH <= 0) return;

  const { Rw, Rh } = eyedropperAspectContainRect(innerW, innerH, bitmapW, bitmapH);
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

/** Loupe canvas size (CSS pixels). */
export const EYEDROPPER_LOUPE_SIZE = 120;
/** Source pixels on each side of center (side length = 2 * radius + 1). */
export const EYEDROPPER_LOUPE_PIXEL_RADIUS = 10;

export const EYEDROPPER_ZOOM_MIN = 1;
export const EYEDROPPER_ZOOM_MAX = 8;
export const EYEDROPPER_ZOOM_STEP = 1.1;

export function clampEyedropperZoom(z: number): number {
  return Math.max(EYEDROPPER_ZOOM_MIN, Math.min(EYEDROPPER_ZOOM_MAX, z));
}

/**
 * CSS scale (bitmap px → CSS px) so the full bitmap fits in the viewport (object-fit: contain),
 * preserving image aspect ratio and centering.
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
 * Clamp absolute zoom scale relative to the contain-fit scale `zFit`.
 * Minimum is exactly `zFit` (image fills the view; cannot zoom out further). Maximum is `zFit * EYEDROPPER_ZOOM_MAX`.
 */
export function clampEyedropperZoomToFitRange(z: number, zFit: number): number {
  if (zFit <= 0) return z;
  const min = zFit;
  const max = zFit * EYEDROPPER_ZOOM_MAX;
  return Math.max(min, Math.min(max, z));
}

/** Rectangle in canvas pixel space for `getImageData` / `drawImage` (clamped at edges). */
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

/** Place fixed loupe so it stays on-screen and away from the cursor. */
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
 * Crosshair center in loupe canvas coordinates; `sw`/`sh` are the sampled region size.
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
  const cx = ((cursorPx - sx) + 0.5) * (loupeSize / sw);
  const cy = ((cursorPy - sy) + 0.5) * (loupeSize / sh);
  return { cx, cy };
}
