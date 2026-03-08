/**
 * Screen color picker: uses Electron screen capture when available (full-screen
 * pick including outside the app window, multi-monitor), otherwise falls back to EyeDropper API.
 * Must be invoked from a user gesture (e.g. button click).
 */

declare global {
  interface Window {
    EyeDropper?: new () => {
      open(options?: { signal?: AbortSignal }): Promise<{ sRGBHex: string }>;
    };
  }
}

export function isEyedropperSupported(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.electronAPI?.eyedropperGetScreenSourcesWithBounds) return true;
  return 'EyeDropper' in window;
}

function rgbToHex(r: number, g: number, b: number): string {
  const pad = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${pad(r)}${pad(g)}${pad(b)}`;
}

/** Capture one frame from a desktop source stream into a canvas. Stops the stream after one frame. */
async function captureOneFrame(sourceId: string): Promise<HTMLCanvasElement | null> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sourceId,
      },
    } as MediaTrackConstraints,
  });

  const video = document.createElement('video');
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.srcObject = stream;

  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve();
    video.onerror = () => reject(new Error('Video load failed'));
  });

  const w = video.videoWidth;
  const h = video.videoHeight;
  stream.getTracks().forEach((t) => t.stop());
  if (!w || !h) return null;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0);
  return canvas;
}

/** Map (clientX, clientY) to canvas pixel (px, py) using wrapper rect; returns null if out of bounds. */
function clientToCanvasPixel(
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

const LOUPE_SIZE = 120;
const LOUPE_PIXEL_RADIUS = 10; // 21×21 source region
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 8;
const ZOOM_STEP = 1.1;

/**
 * Full-screen picker via Electron: capture one static frame per display (no live feed = no feedback),
 * composite all monitors, show overlay with zoom and pixel loupe, return pixel color on click or null on cancel.
 */
async function pickColorFromScreenElectron(): Promise<string | null> {
  const api = window.electronAPI?.eyedropperGetScreenSourcesWithBounds;
  if (!api) return null;

  const { sources, fullBounds } = await api();
  if (sources.length === 0 || fullBounds.width <= 0 || fullBounds.height <= 0) return null;

  const { x: originX, y: originY, width: totalW, height: totalH } = fullBounds;

  const frames = await Promise.all(sources.map((s) => captureOneFrame(s.sourceId)));

  const composite = document.createElement('canvas');
  composite.width = totalW;
  composite.height = totalH;
  const ctx = composite.getContext('2d');
  if (!ctx) return null;

  for (let i = 0; i < sources.length; i++) {
    const frame = frames[i];
    const s = sources[i];
    if (!frame) continue;
    ctx.drawImage(frame, s.x - originX, s.y - originY, s.width, s.height);
  }

  const overlay = document.createElement('div');
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:2147483647',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'background:rgba(0,0,0,0.3)',
    'cursor:crosshair',
  ].join(';');

  const hint = document.createElement('div');
  hint.textContent = 'Scroll to zoom • Loupe follows cursor • Click to pick • Esc to cancel';
  hint.style.cssText = [
    'position:fixed',
    'top:16px',
    'left:50%',
    'transform:translateX(-50%)',
    'color:#fff',
    'text-shadow:0 1px 2px #000',
    'font-size:14px',
    'pointer-events:none',
  ].join(';');
  overlay.appendChild(hint);

  const zoomWrapper = document.createElement('div');
  zoomWrapper.style.cssText = [
    'max-width:100%',
    'max-height:100%',
    'flex-shrink:0',
    'transform-origin:center',
  ].join(';');
  composite.style.width = '100%';
  composite.style.height = '100%';
  composite.style.maxWidth = '100%';
  composite.style.maxHeight = '100%';
  composite.style.objectFit = 'contain';
  zoomWrapper.appendChild(composite);
  overlay.appendChild(zoomWrapper);

  const loupeContainer = document.createElement('div');
  loupeContainer.style.cssText = [
    'position:fixed',
    `width:${LOUPE_SIZE}px`,
    `height:${LOUPE_SIZE}px`,
    'pointer-events:none',
    'z-index:2147483647',
    'border:2px solid #fff',
    'box-shadow:0 2px 12px rgba(0,0,0,0.5)',
    'display:none',
  ].join(';');
  const loupeCanvas = document.createElement('canvas');
  loupeCanvas.width = LOUPE_SIZE;
  loupeCanvas.height = LOUPE_SIZE;
  loupeCanvas.style.display = 'block';
  loupeContainer.appendChild(loupeCanvas);
  const loupeHex = document.createElement('div');
  loupeHex.style.cssText = [
    'position:absolute',
    'bottom:-22px',
    'left:0',
    'right:0',
    'text-align:center',
    'color:#fff',
    'text-shadow:0 1px 2px #000',
    'font-size:12px',
    'font-family:monospace',
  ].join(';');
  loupeContainer.appendChild(loupeHex);

  let zoom = 1;

  function drawLoupe(px: number, py: number, hex: string) {
    if (!ctx) return;
    const half = LOUPE_PIXEL_RADIUS;
    const size = half * 2 + 1;
    const sx = Math.max(0, px - half);
    const sy = Math.max(0, py - half);
    const w = Math.min(size, totalW - sx);
    const h = Math.min(size, totalH - sy);
    if (w <= 0 || h <= 0) return;
    const imageData = ctx.getImageData(sx, sy, w, h);
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = w;
    srcCanvas.height = h;
    const srcCtx = srcCanvas.getContext('2d');
    if (!srcCtx) return;
    srcCtx.putImageData(imageData, 0, 0);
    const loupeCtx = loupeCanvas.getContext('2d');
    if (!loupeCtx) return;
    loupeCtx.imageSmoothingEnabled = false;
    loupeCtx.clearRect(0, 0, LOUPE_SIZE, LOUPE_SIZE);
    loupeCtx.drawImage(srcCanvas, 0, 0, w, h, 0, 0, LOUPE_SIZE, LOUPE_SIZE);
    loupeCtx.strokeStyle = '#fff';
    loupeCtx.lineWidth = 1;
    loupeCtx.beginPath();
    loupeCtx.moveTo(LOUPE_SIZE / 2, 0);
    loupeCtx.lineTo(LOUPE_SIZE / 2, LOUPE_SIZE);
    loupeCtx.moveTo(0, LOUPE_SIZE / 2);
    loupeCtx.lineTo(LOUPE_SIZE, LOUPE_SIZE / 2);
    loupeCtx.stroke();
    loupeCtx.strokeStyle = '#000';
    loupeCtx.lineWidth = 1;
    loupeCtx.beginPath();
    loupeCtx.moveTo(LOUPE_SIZE / 2 + 1, 0);
    loupeCtx.lineTo(LOUPE_SIZE / 2 + 1, LOUPE_SIZE);
    loupeCtx.moveTo(0, LOUPE_SIZE / 2 + 1);
    loupeCtx.lineTo(LOUPE_SIZE, LOUPE_SIZE / 2 + 1);
    loupeCtx.stroke();
    loupeHex.textContent = hex;
  }

  return new Promise<string | null>((resolve) => {
    function cleanup() {
      loupeContainer.remove();
      overlay.remove();
      document.body.style.overflow = '';
      overlay.removeEventListener('wheel', onWheel);
      overlay.removeEventListener('mousemove', onMouseMove);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', onKeyDown);
        cleanup();
        resolve(null);
      }
    }

    function onWheel(e: WheelEvent) {
      const wr = zoomWrapper.getBoundingClientRect();
      const overImage =
        e.clientX >= wr.left &&
        e.clientX <= wr.right &&
        e.clientY >= wr.top &&
        e.clientY <= wr.bottom;
      if (!overImage) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1 / ZOOM_STEP : ZOOM_STEP;
      zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom * delta));
      zoomWrapper.style.transform = `scale(${zoom})`;
    }

    function onMouseMove(e: MouseEvent) {
      const wrapperRect = zoomWrapper.getBoundingClientRect();
      const inBounds =
        e.clientX >= wrapperRect.left &&
        e.clientX <= wrapperRect.right &&
        e.clientY >= wrapperRect.top &&
        e.clientY <= wrapperRect.bottom;
      if (!inBounds) {
        loupeContainer.style.display = 'none';
        hint.textContent = 'Scroll to zoom • Loupe follows cursor • Click to pick • Esc to cancel';
        return;
      }
      const pt = clientToCanvasPixel(e.clientX, e.clientY, zoomWrapper, totalW, totalH);
      if (!pt || !ctx) {
        loupeContainer.style.display = 'none';
        return;
      }
      const imageData = ctx.getImageData(pt.px, pt.py, 1, 1);
      const [r, g, b] = imageData.data;
      const hex = rgbToHex(r, g, b);
      hint.textContent = `Click to pick • Esc to cancel • ${hex}`;
      loupeContainer.style.display = 'block';
      const offset = 16;
      let left = e.clientX + offset;
      let top = e.clientY + offset;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (left + LOUPE_SIZE + 4 > vw) left = e.clientX - LOUPE_SIZE - offset;
      if (top + LOUPE_SIZE + 30 > vh) top = e.clientY - LOUPE_SIZE - offset;
      if (left < 4) left = 4;
      if (top < 4) top = 4;
      loupeContainer.style.left = `${left}px`;
      loupeContainer.style.top = `${top}px`;
      drawLoupe(pt.px, pt.py, hex);
    }

    document.body.style.overflow = 'hidden';
    document.body.appendChild(overlay);
    document.body.appendChild(loupeContainer);
    document.addEventListener('keydown', onKeyDown);
    overlay.addEventListener('wheel', onWheel, { passive: false });
    overlay.addEventListener('mousemove', onMouseMove);

    overlay.addEventListener(
      'click',
      (e) => {
        if (e.target !== composite) return;
        const pt = clientToCanvasPixel(e.clientX, e.clientY, zoomWrapper, totalW, totalH);
        if (!pt) return;
        const imageData = ctx.getImageData(pt.px, pt.py, 1, 1);
        const [r, g, b] = imageData.data;
        document.removeEventListener('keydown', onKeyDown);
        cleanup();
        resolve(rgbToHex(r, g, b));
      },
      { once: true },
    );
  });
}

/**
 * Opens the system eyedropper or Electron full-screen picker; user clicks a pixel to select a color.
 * Returns the hex color (#rrggbb) or null if unsupported, cancelled, or error.
 * Must be called from a user gesture (e.g. button click).
 * In Electron, uses a single snapshot of all monitors (no live feed) so picking works outside the window.
 */
export async function pickColorFromScreen(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  if (window.electronAPI?.eyedropperGetScreenSourcesWithBounds) {
    try {
      return await pickColorFromScreenElectron();
    } catch {
      return null;
    }
  }

  if (!window.EyeDropper) return null;
  try {
    const dropper = new window.EyeDropper();
    const result = await dropper.open();
    return result?.sRGBHex ?? null;
  } catch {
    return null;
  }
}
