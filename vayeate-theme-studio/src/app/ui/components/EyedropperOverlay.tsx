import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import { ThemeActionType } from '../../actions/action-types';
import { useAppDispatch } from '../context/slice-contexts';
import { useAppState } from '../context/useAppState';
import {
  clampElementScroll,
  clampEyedropperCanvasInAspectBounds,
  clampEyedropperZoomToFitRange,
  clientToCanvasFloat,
  clientToCanvasPixel,
  EYEDROPPER_LOUPE_PIXEL_RADIUS,
  EYEDROPPER_LOUPE_SIZE,
  EYEDROPPER_ZOOM_MAX,
  EYEDROPPER_ZOOM_STEP,
  eyedropperZoomFitContain,
  loupeCrosshairCenter,
  loupeFixedPosition,
  loupeSourceRect,
  rgbToHex,
  scrollContainerContentSize,
} from '../utils/eyedropper';

/** Full-screen screen snapshot overlay; driven by `state.ui.eyedropper`. */
export function EyedropperOverlay() {
  const { state } = useAppState();
  const dispatch = useAppDispatch();
  const { phase, snapshot, errorMessage, contextKey } = state.ui.eyedropper;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loupeCanvasRef = useRef<HTMLCanvasElement>(null);
  const zoomRef = useRef(1);
  /** “Fit entire bitmap in view” scale: min(viewportW/tw, viewportH/th). */
  const zoomFitRef = useRef(0);
  const lastFitContextKeyRef = useRef<string | null>(null);
  const wheelCorrectionRef = useRef<{
    clientX: number;
    clientY: number;
    fx: number;
    fy: number;
  } | null>(null);
  const [snapshotBitmapError, setSnapshotBitmapError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [previewHex, setPreviewHex] = useState<string | null>(null);
  /** Content area inside scroll padding (matches aspect “view bounds” / contain fit). */
  const [scrollViewport, setScrollViewport] = useState({ w: 0, h: 0 });

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    setSnapshotBitmapError(null);
    wheelCorrectionRef.current = null;
    lastFitContextKeyRef.current = null;
    setPointer(null);
    setPreviewHex(null);
  }, [phase, snapshot]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || phase !== 'ready' || !snapshot) return;
    const sync = () => {
      const { w, h } = scrollContainerContentSize(el);
      setScrollViewport({ w, h });
    };
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => ro.disconnect();
  }, [phase, snapshot]);

  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    const canvas = canvasRef.current;
    if (!scroll || !canvas || phase !== 'ready' || !snapshot) return;
    const tw = snapshot.fullBounds.width;
    const th = snapshot.fullBounds.height;
    clampEyedropperCanvasInAspectBounds(scroll, canvas, tw, th);
  }, [scrollViewport.w, scrollViewport.h, zoom, phase, snapshot]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || phase !== 'ready') return;
    const onScroll = () => {
      const canvas = canvasRef.current;
      if (!canvas || !snapshot) return;
      clampEyedropperCanvasInAspectBounds(
        el,
        canvas,
        snapshot.fullBounds.width,
        snapshot.fullBounds.height,
      );
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [phase, snapshot]);

  /** Contain-fit scale + initial zoom to fit; on viewport resize, re-clamp zoom to fit-relative range. */
  useEffect(() => {
    const { w: vw, h: vh } = scrollViewport;
    if (phase !== 'ready' || !snapshot || vw <= 0 || vh <= 0) return;
    const tw = snapshot.fullBounds.width;
    const th = snapshot.fullBounds.height;
    if (tw <= 0 || th <= 0) return;
    const zFit = eyedropperZoomFitContain(vw, vh, tw, th);
    zoomFitRef.current = zFit;
    const key = contextKey ?? '';
    if (lastFitContextKeyRef.current !== key) {
      lastFitContextKeyRef.current = key;
      setZoom(zFit);
      zoomRef.current = zFit;
      scrollRef.current?.scrollTo(0, 0);
    } else {
      setZoom((z0) => {
        const z1 = clampEyedropperZoomToFitRange(z0, zFit);
        zoomRef.current = z1;
        return z1;
      });
    }
  }, [phase, snapshot, contextKey, scrollViewport]);

  useEffect(() => {
    if (phase !== 'ready' || !snapshot) return;
    let cancelled = false;
    const run = async () => {
      const { fullBounds, displays } = snapshot;
      const { x: ox, y: oy, width: tw, height: th } = fullBounds;
      const canvas = canvasRef.current;
      if (!canvas || tw <= 0 || th <= 0) {
        if (!cancelled && displays.length === 0) {
          setSnapshotBitmapError('No screens were captured.');
        }
        return;
      }
      canvas.width = tw;
      canvas.height = th;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setSnapshotBitmapError('Canvas is not available.');
        return;
      }
      ctx.clearRect(0, 0, tw, th);
      try {
        for (const d of displays) {
          const bytes = new Uint8Array(d.png);
          if (bytes.byteLength === 0) continue;
          const blob = new Blob([bytes], { type: 'image/png' });
          const bmp = await createImageBitmap(blob);
          if (cancelled) {
            bmp.close();
            return;
          }
          ctx.drawImage(bmp, d.x - ox, d.y - oy, d.width, d.height);
          bmp.close();
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : String(e);
          setSnapshotBitmapError(msg);
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [phase, snapshot]);

  useLayoutEffect(() => {
    const corr = wheelCorrectionRef.current;
    if (!corr || phase !== 'ready' || !snapshot) return;
    const canvas = canvasRef.current;
    const scroll = scrollRef.current;
    if (!canvas || !scroll) return;
    const tw = snapshot.fullBounds.width;
    const th = snapshot.fullBounds.height;
    const cr = canvas.getBoundingClientRect();
    const px = cr.left + (corr.fx / tw) * cr.width;
    const py = cr.top + (corr.fy / th) * cr.height;
    scroll.scrollLeft -= corr.clientX - px;
    scroll.scrollTop -= corr.clientY - py;
    clampElementScroll(scroll);
    clampEyedropperCanvasInAspectBounds(scroll, canvas, tw, th);
    wheelCorrectionRef.current = null;
  }, [zoom, phase, snapshot]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || phase !== 'ready' || snapshotBitmapError || !snapshot) return;
    const tw = snapshot.fullBounds.width;
    const th = snapshot.fullBounds.height;
    const onWheel = (e: Event) => {
      const we = e as WheelEvent;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const anchor = clientToCanvasFloat(we.clientX, we.clientY, canvas, tw, th);
      if (!anchor) {
        return;
      }
      we.preventDefault();
      const zf = zoomFitRef.current;
      if (zf <= 0) return;
      const z0 = zoomRef.current;
      const z1 = clampEyedropperZoomToFitRange(
        z0 * (we.deltaY < 0 ? EYEDROPPER_ZOOM_STEP : 1 / EYEDROPPER_ZOOM_STEP),
        zf,
      );
      if (Math.abs(z1 - z0) < 1e-9) return;
      wheelCorrectionRef.current = {
        clientX: we.clientX,
        clientY: we.clientY,
        fx: anchor.fx,
        fy: anchor.fy,
      };
      setZoom(z1);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [phase, snapshotBitmapError, snapshot]);

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

  useEffect(() => {
    if (!pointer || phase !== 'ready' || snapshotBitmapError || !snapshot) {
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
      const pt = clientToCanvasPixel(pointer.x, pointer.y, canvas, canvas.width, canvas.height);
      const lctx = loupe.getContext('2d');
      if (!pt || !lctx) return;

      loupe.width = EYEDROPPER_LOUPE_SIZE;
      loupe.height = EYEDROPPER_LOUPE_SIZE;

      const { sx, sy, sw, sh } = loupeSourceRect(
        pt.px,
        pt.py,
        EYEDROPPER_LOUPE_PIXEL_RADIUS,
        canvas.width,
        canvas.height,
      );
      lctx.imageSmoothingEnabled = false;
      lctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, EYEDROPPER_LOUPE_SIZE, EYEDROPPER_LOUPE_SIZE);

      const { cx, cy } = loupeCrosshairCenter(pt.px, pt.py, sx, sy, sw, sh, EYEDROPPER_LOUPE_SIZE);
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
  }, [pointer, phase, snapshot, snapshotBitmapError]);

  const onCancel = useCallback(() => {
    void dispatch({ type: ThemeActionType.ThemeEyedropperOverlayCancelButtonOnClick });
  }, [dispatch]);

  const onCanvasMouseMove = useCallback(
    (e: MouseEvent<HTMLCanvasElement>) => {
      setPointer({ x: e.clientX, y: e.clientY });
      const canvas = canvasRef.current;
      if (!canvas || !snapshot) return;
      const pt = clientToCanvasPixel(e.clientX, e.clientY, canvas, canvas.width, canvas.height);
      if (!pt) {
        setPreviewHex(null);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const [r, g, b] = ctx.getImageData(pt.px, pt.py, 1, 1).data;
      setPreviewHex(rgbToHex(r, g, b));
    },
    [snapshot],
  );

  const onCanvasMouseLeave = useCallback(() => {
    setPointer(null);
    setPreviewHex(null);
  }, []);

  const onCanvasClick = useCallback(
    (e: MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !snapshot) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const { width: totalW, height: totalH } = snapshot.fullBounds;
      const pt = clientToCanvasPixel(e.clientX, e.clientY, canvas, totalW, totalH);
      if (!pt) return;
      const data = ctx.getImageData(pt.px, pt.py, 1, 1);
      const [r, g, b] = data.data;
      const hex = rgbToHex(r, g, b);
      void dispatch({ type: ThemeActionType.ThemeEyedropperOverlayColorCommitOnClick, hex });
    },
    [dispatch, snapshot],
  );

  if (phase === 'closed') return null;

  const tw = snapshot?.fullBounds.width ?? 0;
  const th = snapshot?.fullBounds.height ?? 0;
  const canvasW = tw * zoom;
  const canvasH = th * zoom;
  const { w: vw, h: vh } = scrollViewport;
  const zFit =
    vw > 0 && vh > 0 && tw > 0 && th > 0 ? eyedropperZoomFitContain(vw, vh, tw, th) : 0;
  /** Same as canvas when zoom ≥ zFit (min zoom is always zFit). */
  const layoutScale = zFit > 0 ? Math.max(zoom, zFit) : zoom;
  const innerMinW = tw * layoutScale;
  const innerMinH = th * layoutScale;
  const zoomVsFitLabel =
    zFit > 0 ? `${(zoom / zFit).toFixed(2)}× fit` : `${zoom.toFixed(2)}×`;

  const loupePos =
    pointer && phase === 'ready' && !snapshotBitmapError
      ? loupeFixedPosition(pointer.x, pointer.y, EYEDROPPER_LOUPE_SIZE, window.innerWidth, window.innerHeight)
      : null;

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
          textAlign: 'center',
        }}
      >
        Wheel: zoom {zoomVsFitLabel} (min 1× fit, max ×{EYEDROPPER_ZOOM_MAX} fit) • Click to pick • Esc / backdrop to cancel
        {previewHex && (
          <>
            <br />
            <span style={{ fontSize: 15, fontWeight: 600 }}>{previewHex}</span>
          </>
        )}
      </p>
      {phase === 'loading' && <p style={{ color: '#fff' }}>Capturing screen…</p>}
      {phase === 'ready' && snapshotBitmapError && (
        <div style={{ color: '#fff', textAlign: 'center', maxWidth: 480 }}>
          <p>Could not draw the screen snapshot.</p>
          <p style={{ fontSize: 12, opacity: 0.9 }}>{snapshotBitmapError}</p>
          <button type="button" onClick={onCancel}>
            Close
          </button>
        </div>
      )}
      {phase === 'error' && (
        <div style={{ color: '#fff', textAlign: 'center' }}>
          <p>{errorMessage ?? 'Capture failed'}</p>
          <button type="button" onClick={onCancel}>
            Close
          </button>
        </div>
      )}
      {phase === 'ready' && snapshot && !snapshotBitmapError && tw > 0 && th > 0 && (
        <div
          ref={scrollRef}
          className="eyedropper-overlay-scroll"
          style={{
            flex: 1,
            overflow: 'auto',
            minHeight: 0,
            maxWidth: '100%',
            maxHeight: '100%',
            padding: 24,
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              minWidth: innerMinW,
              minHeight: innerMinH,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              boxSizing: 'border-box',
            }}
          >
            <canvas
              ref={canvasRef}
              role="img"
              aria-label="Screen snapshot — move to preview, click to pick a color"
              style={{
                display: 'block',
                width: canvasW,
                height: canvasH,
                flexShrink: 0,
                imageRendering: 'pixelated',
              }}
              onMouseMove={onCanvasMouseMove}
              onMouseLeave={onCanvasMouseLeave}
              onClick={onCanvasClick}
            />
          </div>
        </div>
      )}
      {loupePos && pointer && (
        <canvas
          ref={loupeCanvasRef}
          width={EYEDROPPER_LOUPE_SIZE}
          height={EYEDROPPER_LOUPE_SIZE}
          style={{
            position: 'fixed',
            left: loupePos.left,
            top: loupePos.top,
            width: EYEDROPPER_LOUPE_SIZE,
            height: EYEDROPPER_LOUPE_SIZE,
            pointerEvents: 'none',
            zIndex: 2147483647,
            borderRadius: 6,
            boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
            border: '2px solid rgba(255,255,255,0.9)',
          }}
          aria-hidden
        />
      )}
    </div>
  );
}
