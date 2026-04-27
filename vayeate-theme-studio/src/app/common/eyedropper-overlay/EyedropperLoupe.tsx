import { useEffect, RefObject } from 'react';
import { useEyedropperLoupeViewModel } from './use-eyedropper-loupe-viewmodel';
import {
  EYEDROPPER_LOUPE_SIZE,
  EYEDROPPER_LOUPE_PIXEL_RADIUS,
  loupeSourceRect,
  loupeCrosshairCenter,
} from './eyedropper-utils';
import { EyedropperUiStore } from '../../../domain/state/ui/eyedropper-ui-store';
import { container } from 'tsyringe';
import { useStore } from 'zustand';

const eyedropperUiStore = container.resolve(EyedropperUiStore);

interface EyedropperLoupeProps {
  loupeCanvasRef: RefObject<HTMLCanvasElement>;
  isOpen: boolean;
  errorMessage: string | null;
  canvasRef: RefObject<HTMLCanvasElement>;
}

export function EyedropperLoupe({
  loupeCanvasRef,
  isOpen,
  errorMessage,
  canvasRef,
}: EyedropperLoupeProps) {
  const mouseX = useStore(eyedropperUiStore.api, (state) => state.state.mouseX);
  const mouseY = useStore(eyedropperUiStore.api, (state) => state.state.mouseY);
  const pointer = mouseX > 0 || mouseY > 0 ? { x: mouseX, y: mouseY } : null;
  const { loupePos } = useEyedropperLoupeViewModel(pointer, isOpen, errorMessage);

  // Loupe rendering
  useEffect(() => {
    if (!pointer || !isOpen || errorMessage !== null) {
      const loupe = loupeCanvasRef.current;
      if (loupe) {
        const ctx = loupe.getContext('2d');
        ctx?.clearRect(0, 0, loupe.width, loupe.height);
      }
      return;
    }
    const id = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      const loupe = loupeCanvasRef.current;
      if (!canvas || !loupe) return;
      const lctx = loupe.getContext('2d');
      if (!lctx) return;

      loupe.width = EYEDROPPER_LOUPE_SIZE;
      loupe.height = EYEDROPPER_LOUPE_SIZE;

      const { sx, sy, sw, sh } = loupeSourceRect(
        pointer.x,
        pointer.y,
        EYEDROPPER_LOUPE_PIXEL_RADIUS,
        canvas.width,
        canvas.height,
      );
      lctx.imageSmoothingEnabled = false;
      lctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, EYEDROPPER_LOUPE_SIZE, EYEDROPPER_LOUPE_SIZE);

      const { cx, cy } = loupeCrosshairCenter(pointer.x, pointer.y, sx, sy, sw, sh, EYEDROPPER_LOUPE_SIZE);
      lctx.strokeStyle = 'rgba(0,0,0,0.75)';
      lctx.lineWidth = 2;
      lctx.beginPath();
      lctx.moveTo(cx, 0);
      lctx.lineTo(cx, EYEDROPPER_LOUPE_SIZE);
      lctx.moveTo(0, cy);
      lctx.lineTo(EYEDROPPER_LOUPE_SIZE, cy);
      lctx.stroke();
      lctx.strokeStyle = 'rgba(255,255,255,0.95)';
      lctx.lineWidth = 1;
      lctx.beginPath();
      lctx.moveTo(cx, 0);
      lctx.lineTo(cx, EYEDROPPER_LOUPE_SIZE);
      lctx.moveTo(0, cy);
      lctx.lineTo(EYEDROPPER_LOUPE_SIZE, cy);
      lctx.stroke();
    });
    return () => cancelAnimationFrame(id);
  }, [pointer, isOpen, errorMessage, canvasRef, loupeCanvasRef]);

  if (!loupePos) return null;

  return (
    <canvas
      ref={loupeCanvasRef}
      width={EYEDROPPER_LOUPE_SIZE}
      height={EYEDROPPER_LOUPE_SIZE}
      className="eyedropper-loupe"
      style={{
        left: loupePos.left,
        top: loupePos.top,
        width: EYEDROPPER_LOUPE_SIZE,
        height: EYEDROPPER_LOUPE_SIZE,
      }}
      aria-hidden
    />
  );
}
