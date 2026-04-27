import { forwardRef, MouseEvent, useEffect, useRef } from 'react';
import { useEyedropperCanvasViewModel } from './use-eyedropper-canvas-viewmodel';
import { clientToCanvasPixel, rgbToHex } from './eyedropper-utils';
import { HexColor } from '../../../model/schema/primitives';

export const EyedropperCanvas = forwardRef<HTMLCanvasElement>((_, canvasRef) => {
  
  const internalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    canvasWidth,
    canvasHeight,
    snapshotX,
    snapshotY,
    snapshotWidth,
    snapshotHeight,
    snapshotDisplays,
    onCanvasMouseMove,
    onCanvasClick,
  } = useEyedropperCanvasViewModel();

  function getCanvasPositionAndColor(clientX: number, clientY: number): { canvasX: number; canvasY: number; hex: HexColor } | null {
    const canvas = internalCanvasRef.current;
    if (!canvas) return null;
    const pt = clientToCanvasPixel(clientX, clientY, canvas, canvas.width, canvas.height);
    if (!pt) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const [r, g, b] = ctx.getImageData(pt.px, pt.py, 1, 1).data;
    return { canvasX: pt.px, canvasY: pt.py, hex: rgbToHex(r, g, b) };
  }

  function loadSnapshotToCanvas(ctx: CanvasRenderingContext2D): void {
    void (async () => {
      ctx.clearRect(0, 0, snapshotWidth, snapshotHeight);
      for (const d of snapshotDisplays) {
        ctx.drawImage(d.bmp, d.x - snapshotX, d.y - snapshotY, d.width, d.height);
      }
    })();
  }

  useEffect(() => {
    const canvas = internalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    loadSnapshotToCanvas(ctx);
  }, [snapshotWidth, snapshotHeight, snapshotDisplays, internalCanvasRef.current]);
  
  const onMouseClick = (e: MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    const positionAndColor = getCanvasPositionAndColor(e.clientX, e.clientY);
    if (!positionAndColor) return;

    const { hex } = positionAndColor;
    onCanvasClick(hex);
  };

  const onMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const positionAndColor = getCanvasPositionAndColor(e.clientX, e.clientY);
    if (!positionAndColor) return;

    const {
      canvasX,
      canvasY,
      hex
    } = positionAndColor;
    onCanvasMouseMove(canvasX, canvasY, hex);
  };

  return (
    <canvas
      ref={(node) => {
        internalCanvasRef.current = node;
        if (typeof canvasRef === 'function') {
          canvasRef(node);
        } else if (canvasRef) {
          canvasRef.current = node;
        }
      }}
      role="img"
      aria-label="Screen snapshot — move to preview, click to pick a color"
      className="eyedropper-canvas"
      style={{
        width: canvasWidth,
        height: canvasHeight,
      }}
      onMouseMove={onMouseMove}
      onClick={onMouseClick}
    />
  );
});
