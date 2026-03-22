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
