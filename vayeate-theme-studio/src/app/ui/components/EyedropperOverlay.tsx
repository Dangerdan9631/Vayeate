import { useCallback, useEffect, useRef, type MouseEvent } from 'react';
import { ThemeActionType } from '../../actions/action-types';
import { useAppDispatch } from '../context/slice-contexts';
import { useAppState } from '../context/useAppState';
import { clientToCanvasPixel, rgbToHex } from '../utils/eyedropper';

/** Full-screen screen snapshot overlay; driven by `state.ui.eyedropper`. */
export function EyedropperOverlay() {
  const { state } = useAppState();
  const dispatch = useAppDispatch();
  const { phase, snapshot, errorMessage } = state.ui.eyedropper;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const zoomWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase !== 'ready' || !snapshot) return;
    let cancelled = false;
    const run = async () => {
      const { fullBounds, displays } = snapshot;
      const { x: ox, y: oy, width: tw, height: th } = fullBounds;
      const canvas = canvasRef.current;
      if (!canvas || tw <= 0 || th <= 0) return;
      canvas.width = tw;
      canvas.height = th;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, tw, th);
      for (const d of displays) {
        const blob = new Blob([new Uint8Array(d.png)], { type: 'image/png' });
        const bmp = await createImageBitmap(blob);
        if (cancelled) {
          bmp.close();
          return;
        }
        ctx.drawImage(bmp, d.x - ox, d.y - oy, d.width, d.height);
        bmp.close();
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [phase, snapshot]);

  useEffect(() => {
    if (phase === 'closed') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        void dispatch({ type: ThemeActionType.ThemeEyedropperOverlayCancelButtonOnClick });
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [phase, dispatch]);

  const onCancel = useCallback(() => {
    void dispatch({ type: ThemeActionType.ThemeEyedropperOverlayCancelButtonOnClick });
  }, [dispatch]);

  const onCanvasClick = useCallback(
    (e: MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const wrap = zoomWrapperRef.current;
      if (!canvas || !wrap || !snapshot) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const { width: totalW, height: totalH } = snapshot.fullBounds;
      const pt = clientToCanvasPixel(e.clientX, e.clientY, wrap, totalW, totalH);
      if (!pt) return;
      const data = ctx.getImageData(pt.px, pt.py, 1, 1);
      const [r, g, b] = data.data;
      const hex = rgbToHex(r, g, b);
      void dispatch({ type: ThemeActionType.ThemeEyedropperOverlayColorCommitOnClick, hex });
    },
    [dispatch, snapshot],
  );

  if (phase === 'closed') return null;

  return (
    <div
      className="eyedropper-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483647,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.35)',
        cursor: 'crosshair',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <p
        style={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#fff',
          textShadow: '0 1px 2px #000',
          pointerEvents: 'none',
        }}
      >
        Click image to pick • Esc or backdrop to cancel
      </p>
      {phase === 'loading' && <p style={{ color: '#fff' }}>Capturing screen…</p>}
      {phase === 'error' && (
        <div style={{ color: '#fff', textAlign: 'center' }}>
          <p>{errorMessage ?? 'Capture failed'}</p>
          <button type="button" onClick={onCancel}>
            Close
          </button>
        </div>
      )}
      {phase === 'ready' && snapshot && (
        <div ref={zoomWrapperRef} style={{ maxWidth: '100%', maxHeight: '100%' }}>
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Screen snapshot — click to pick a color"
            style={{ display: 'block', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            onClick={onCanvasClick}
          />
        </div>
      )}
    </div>
  );
}
