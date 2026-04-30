import { forwardRef, MouseEvent, useEffect, useRef } from 'react';
import { useEyedropperCanvasViewModel } from './use-eyedropper-canvas-viewmodel';
import { clientToCanvasPixel, getCanvasColor, loadSnapshotToCanvas } from './eyedropper-utils';
import { HexColor } from '../../../model/schema/primitives';
import { Point } from '../../../model/geometry';

export const EyedropperCanvas = forwardRef<HTMLCanvasElement>((_, canvasRef) => {
  
  const internalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    canvasSize,
    snapshotBounds,
    snapshotDisplays,
    onCanvasMouseMove,
    onCanvasClick,
  } = useEyedropperCanvasViewModel();

  function getCanvasPositionAndColor(clientPosition: Point): { canvasPosition: Point; hex: HexColor } | null {
    const canvas = internalCanvasRef.current;
    if (!canvas) return null;
    const canvasPosition = clientToCanvasPixel(clientPosition, canvas);
    if (!canvasPosition) return null;
    const hex = getCanvasColor(canvas, canvasPosition);
    return (hex)
      ? { canvasPosition, hex }
      : null;
  }

  useEffect(() => {
    const canvas = internalCanvasRef.current;
    if (!canvas) return;
    void loadSnapshotToCanvas(canvas, snapshotBounds, snapshotDisplays);
  }, [snapshotBounds, snapshotDisplays]);
  
  const onMouseClick = (e: MouseEvent<HTMLCanvasElement>) => {
    e.stopPropagation();
    const positionAndColor = getCanvasPositionAndColor({ x: e.clientX, y: e.clientY });
    if (!positionAndColor) return;

    const { hex } = positionAndColor;
    onCanvasClick(hex);
  };

  const onMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    const positionAndColor = getCanvasPositionAndColor({ x: e.clientX, y: e.clientY });
    if (!positionAndColor) return;

    const {
      canvasPosition,
      hex
    } = positionAndColor;
    onCanvasMouseMove(canvasPosition, hex);
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
      style={canvasSize}
      onMouseMove={onMouseMove}
      onClick={onMouseClick}
    />
  );
});
