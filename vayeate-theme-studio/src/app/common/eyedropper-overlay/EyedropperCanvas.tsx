import { forwardRef, MouseEvent, useEffect, useRef } from 'react';
import { useEyedropperCanvasViewModel } from './use-eyedropper-canvas-viewmodel';
import { clientToCanvasPixel, getCanvasColor, loadSnapshotToCanvas } from './eyedropper-utils';
import type { EyedropperPointerSample } from '../../../model/eyedropper';
import type { Point } from '../../../model/point';

/**
 * Draws the captured display snapshot and samples colors under the pointer.
 * @returns A forward-ref canvas element wired to eyedropper pointer actions.
 */
export const EyedropperCanvas = forwardRef<HTMLCanvasElement>((_, canvasRef) => {
  const internalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pendingPointerRef = useRef<EyedropperPointerSample | null>(null);
  const pointerFrameRef = useRef<number | null>(null);

  const {
    canvasSize,
    snapshotBounds,
    snapshotDisplays,
    onCanvasMouseMove,
    onCanvasClick,
  } = useEyedropperCanvasViewModel();

  function getCanvasPointerSample(clientPosition: Point): EyedropperPointerSample | null {
    const canvas = internalCanvasRef.current;
    if (!canvas) return null;
    const canvasPosition = clientToCanvasPixel(clientPosition, canvas);
    if (!canvasPosition) return null;
    const previewHex = getCanvasColor(canvas, canvasPosition);
    return previewHex ? { clientPosition, canvasPosition, previewHex } : null;
  }

  useEffect(() => {
    const canvas = internalCanvasRef.current;
    if (!canvas) return;
    void loadSnapshotToCanvas(canvas, snapshotBounds, snapshotDisplays);
  }, [snapshotBounds, snapshotDisplays]);

  useEffect(() => () => {
    if (pointerFrameRef.current !== null) {
      cancelAnimationFrame(pointerFrameRef.current);
    }
  }, []);

  function scheduleCanvasMouseMove(pointerSample: EyedropperPointerSample) {
    pendingPointerRef.current = pointerSample;
    if (pointerFrameRef.current !== null) return;

    pointerFrameRef.current = requestAnimationFrame(() => {
      pointerFrameRef.current = null;
      const nextPointer = pendingPointerRef.current;
      pendingPointerRef.current = null;
      if (nextPointer) {
        onCanvasMouseMove(nextPointer);
      }
    });
  }

  function onMouseClick(e: MouseEvent<HTMLCanvasElement>) {
    e.stopPropagation();
    const pointerSample = getCanvasPointerSample({ x: e.clientX, y: e.clientY });
    if (!pointerSample) return;

    onCanvasClick(pointerSample.previewHex);
  }

  function onMouseMove(e: MouseEvent<HTMLCanvasElement>) {
    const pointerSample = getCanvasPointerSample({ x: e.clientX, y: e.clientY });
    if (!pointerSample) return;

    scheduleCanvasMouseMove(pointerSample);
  }

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
      width={snapshotBounds.width}
      height={snapshotBounds.height}
      style={canvasSize}
      onMouseMove={onMouseMove}
      onClick={onMouseClick}
    />
  );
});
