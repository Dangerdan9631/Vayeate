import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import type { EyedropperSnapshotPayload } from '../../../domain/state/ui/eyedropper-ui-state';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { EyedropperUiStore } from '../../../domain/state/ui/eyedropper-ui-store';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { WindowStore } from '../../../domain/state/window/window-store';
import { EyedropperOverlayActionType } from './actions/eyedropper-overlay-action-type';
import {
  EYEDROPPER_LOUPE_SIZE,
  EYEDROPPER_LOUPE_PIXEL_RADIUS,
  EYEDROPPER_ZOOM_MAX,
  EYEDROPPER_ZOOM_STEP,
  rgbToHex,
  clientToCanvasPixel,
  clientToCanvasFloatClamped,
  clampElementScroll,
  scrollContainerContentSize,
  clampEyedropperCanvasInAspectBounds,
  eyedropperZoomFitContain,
  clampEyedropperZoomToFitRange,
  loupeSourceRect,
  loupeFixedPosition,
  loupeCrosshairCenter,
} from './eyedropper-utils';

const eyedropperUiStore = container.resolve(EyedropperUiStore);
const windowStore = container.resolve(WindowStore);

export interface EyedropperOverlayViewModel {
  isOpen: boolean;
  errorMessage: string | null;
  snapshot: EyedropperSnapshotPayload | null;
  snapshotBitmapError: string | null;
  previewHex: string | null;
  canvasW: number;
  canvasH: number;
  innerMinW: number;
  innerMinH: number;
  zoomVsFitLabel: string;
  loupePos: { left: number; top: number } | null;
  EYEDROPPER_ZOOM_MAX: number;
  overlayRootRef: React.RefObject<HTMLDivElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  scrollRef: React.RefObject<HTMLDivElement>;
  loupeCanvasRef: React.RefObject<HTMLCanvasElement>;
  onCancel: () => void;
  onBackdropClick: (e: MouseEvent<HTMLDivElement>) => void;
  onCanvasMouseMove: (e: MouseEvent<HTMLCanvasElement>) => void;
  onCanvasMouseLeave: () => void;
  onCanvasClick: (e: MouseEvent<HTMLCanvasElement>) => void;
}

export function useEyedropperOverlayViewModel(): EyedropperOverlayViewModel {
  const dispatch = useAppDispatch();
  const appViewport = useStore(windowStore.api, (state) => state.state.viewport);
  const eyedropper = useStore(eyedropperUiStore.api, (state) => state.state);
  const { snapshot, callbackAction, isOpen, errorMessage, result } = eyedropper;

  const overlayRootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loupeCanvasRef = useRef<HTMLCanvasElement>(null);
  const zoomRef = useRef(1);
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
  const [scrollViewport, setScrollViewport] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!result || !callbackAction) return;
    dispatch(callbackAction);
    // Close overlay after dispatching callback
    void dispatch({ type: EyedropperOverlayActionType.CancelButtonOnClick });
  }, [result, callbackAction, dispatch]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    setSnapshotBitmapError(null);
    wheelCorrectionRef.current = null;
    lastFitContextKeyRef.current = null;
    setPointer(null);
    setPreviewHex(null);
  }, [isOpen, snapshot]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isOpen || errorMessage !== null || !snapshot) return;
    const sync = () => {
      const { w, h } = scrollContainerContentSize(el);
      setScrollViewport({ w, h });
    };
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => ro.disconnect();
  }, [isOpen, snapshot]);

  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    const canvas = canvasRef.current;
    if (!scroll || !canvas || !isOpen || errorMessage !== null || !snapshot) return;
    const tw = snapshot.fullBounds.width;
    const th = snapshot.fullBounds.height;
    clampEyedropperCanvasInAspectBounds(scroll, canvas, tw, th);
  }, [scrollViewport.w, scrollViewport.h, zoom, isOpen, snapshot]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isOpen || errorMessage !== null || !snapshot) return;
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
  }, [isOpen, snapshot]);

  useEffect(() => {
    const { w: vw, h: vh } = scrollViewport;
    if (!isOpen || errorMessage !== null || !snapshot || vw <= 0 || vh <= 0) return;
    const tw = snapshot.fullBounds.width;
    const th = snapshot.fullBounds.height;
    if (tw <= 0 || th <= 0) return;
    const zFit = eyedropperZoomFitContain(vw, vh, tw, th);
    zoomFitRef.current = zFit;
    const key = callbackAction?.type ?? '';
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
  }, [isOpen, snapshot, callbackAction, scrollViewport]);

  useEffect(() => {
    if (!isOpen || errorMessage !== null || !snapshot) return;
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
  }, [isOpen, snapshot]);

  useLayoutEffect(() => {
    const corr = wheelCorrectionRef.current;
    if (!corr || !isOpen || errorMessage !== null || !snapshot) return;
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
  }, [zoom, isOpen, snapshot]);

  useEffect(() => {
    const el = overlayRootRef.current;
    if (!el || !isOpen || errorMessage !== null || snapshotBitmapError || !snapshot) return;
    const tw = snapshot.fullBounds.width;
    const th = snapshot.fullBounds.height;
    const onWheel = (e: Event) => {
      const we = e as WheelEvent;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const anchor = clientToCanvasFloatClamped(we.clientX, we.clientY, canvas, tw, th);
      if (!anchor) return;
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
  }, [isOpen, snapshotBitmapError, snapshot]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        void dispatch({ type: EyedropperOverlayActionType.CancelButtonOnClick });
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (!pointer || !isOpen || errorMessage !== null || snapshotBitmapError || !snapshot) {
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
  }, [pointer, isOpen, snapshot, snapshotBitmapError]);

  const onCancel = useCallback(() => {
    void dispatch({ type: EyedropperOverlayActionType.CancelButtonOnClick });
  }, [dispatch]);

  const onBackdropClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onCancel();
      }
    },
    [onCancel],
  );

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
      void dispatch({ type: EyedropperOverlayActionType.ColorPickCommitButtonOnClick, hex });
    },
    [dispatch, snapshot],
  );

  const tw = snapshot?.fullBounds.width ?? 0;
  const th = snapshot?.fullBounds.height ?? 0;
  const canvasW = tw * zoom;
  const canvasH = th * zoom;
  const { w: vw, h: vh } = scrollViewport;
  const zFit = vw > 0 && vh > 0 && tw > 0 && th > 0 ? eyedropperZoomFitContain(vw, vh, tw, th) : 0;
  const layoutScale = zFit > 0 ? Math.max(zoom, zFit) : zoom;
  const innerMinW = tw * layoutScale;
  const innerMinH = th * layoutScale;
  const zoomVsFitLabel = zFit > 0 ? `${(zoom / zFit).toFixed(2)}× fit` : `${zoom.toFixed(2)}×`;

  const loupeVw = appViewport.width > 0 ? appViewport.width : 1;
  const loupeVh = appViewport.height > 0 ? appViewport.height : 1;
  const loupePos =
    pointer && isOpen && errorMessage === null && !snapshotBitmapError
      ? loupeFixedPosition(pointer.x, pointer.y, EYEDROPPER_LOUPE_SIZE, loupeVw, loupeVh)
      : null;

  return {
    isOpen,
    errorMessage,
    snapshot,
    snapshotBitmapError,
    previewHex,
    canvasW,
    canvasH,
    innerMinW,
    innerMinH,
    zoomVsFitLabel,
    loupePos,
    EYEDROPPER_ZOOM_MAX,
    overlayRootRef,
    canvasRef,
    scrollRef,
    loupeCanvasRef,
    onCancel,
    onBackdropClick,
    onCanvasMouseMove,
    onCanvasMouseLeave,
    onCanvasClick,
  };
}
