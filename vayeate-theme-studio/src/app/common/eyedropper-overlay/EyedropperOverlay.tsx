import { MouseEvent, useEffect, useLayoutEffect, useRef, useState, WheelEvent } from 'react';
import { useEyedropperOverlayViewModel } from './use-eyedropper-overlay-viewmodel';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { EyedropperUiStore } from '../../../domain/state/ui/eyedropper-ui-store';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { EyedropperOverlayActionType } from './actions/eyedropper-overlay-action-type';
import { EyedropperCanvas } from './EyedropperCanvas';
import { EyedropperLoupe } from './EyedropperLoupe';
import {
  clampEyedropperCanvasInAspectBounds,
  clampEyedropperZoomToFitRange,
  clampElementScroll,
  clientToCanvasFloatClamped,
  EYEDROPPER_ZOOM_MAX,
  EYEDROPPER_ZOOM_STEP,
  eyedropperZoomFitContain,
  scrollContainerContentSize,
} from './eyedropper-utils';

const eyedropperUiStore = container.resolve(EyedropperUiStore);

export function EyedropperOverlay() {

  const dispatch = useAppDispatch();
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loupeCanvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollViewport, setScrollViewport] = useState({ w: 0, h: 0 });
  const wheelCorrectionRef = useRef<{
    clientX: number;
    clientY: number;
    fx: number;
    fy: number;
  } | null>(null);
  const eyedropper = useStore(eyedropperUiStore.api, (state) => state.state);
  const { snapshot, callbackAction, isOpen, errorMessage, result, zoom, previewHex } = eyedropper;
  const isLoaded = snapshot !== null && snapshot.fullBounds.width > 0 && snapshot.fullBounds.height > 0;

  const { snapshotWidth, snapshotHeight } = useEyedropperOverlayViewModel();

  // Result callback dispatch
  useEffect(() => {
    if (!result || !callbackAction) return;
    dispatch(callbackAction);
    // Close overlay after dispatching callback
    void dispatch({ type: EyedropperOverlayActionType.CancelButtonOnClick });
  }, [result, callbackAction, dispatch]);

  // Keyboard (Escape) handler
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

  // Track scroll container size
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isOpen || errorMessage !== null || !isLoaded) return;

    const sync = () => {
      const { w, h } = scrollContainerContentSize(el);
      setScrollViewport({ w, h });
    };
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => ro.disconnect();
  }, [scrollRef, isOpen, errorMessage, isLoaded]);

  // Resize canvas to fit in the scroll container
  useLayoutEffect(() => {
    onOverlayScroll();
  }, [scrollViewport.w, scrollViewport.h, isOpen, snapshotWidth, snapshotHeight]);
  

  function onOverlayScroll() {
    const scroll = scrollRef.current;
    const canvas = canvasRef.current;
    if (!scroll || !canvas || !isOpen || errorMessage !== null || !isLoaded) return;
    clampEyedropperCanvasInAspectBounds(
      scroll,
      canvas,
      snapshotWidth,
      snapshotHeight,
    );
  };
  
  const zoomRef = useRef(zoom);
  const zoomFitRef = useRef(0);
  
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useLayoutEffect(() => {
    const corr = wheelCorrectionRef.current;
    if (!corr || !isOpen || errorMessage !== null || !isLoaded) return;
    const canvas = canvasRef.current;
    const scroll = scrollRef.current;
    if (!canvas || !scroll) return;
    const tw = snapshotWidth;
    const th = snapshotHeight;
    const cr = canvas.getBoundingClientRect();
    const px = cr.left + (corr.fx / tw) * cr.width;
    const py = cr.top + (corr.fy / th) * cr.height;
    scroll.scrollLeft -= corr.clientX - px;
    scroll.scrollTop -= corr.clientY - py;
    clampElementScroll(scroll);
    clampEyedropperCanvasInAspectBounds(scroll, canvas, tw, th);
    wheelCorrectionRef.current = null;
  }, [zoom, isOpen, isLoaded, errorMessage, snapshotWidth, snapshotHeight, eyedropperUiStore]);

  useEffect(() => {
    const { w: vw, h: vh } = scrollViewport;
    if (!isOpen || errorMessage !== null || !isLoaded || vw <= 0 || vh <= 0) return;
    if (snapshotWidth <= 0 || snapshotHeight <= 0) return;
    const zFit = eyedropperZoomFitContain(vw, vh, snapshotWidth, snapshotHeight);
    zoomFitRef.current = zFit;
    const z1 = clampEyedropperZoomToFitRange(zoom, zFit);
    if (z1 !== zoom) {
      eyedropperUiStore.setEyedropperZoom(z1);
    }
  }, [isOpen, scrollViewport, zoom, snapshotWidth, snapshotHeight, eyedropperUiStore]);

  // Calculate canvas and layout dimensions based on zoom
  const { w: vw, h: vh } = scrollViewport;
  const zFit = vw > 0 && vh > 0 && snapshotWidth > 0 && snapshotHeight > 0 ? eyedropperZoomFitContain(vw, vh, snapshotWidth, snapshotHeight) : 0;
  const layoutScale = zFit > 0 ? Math.max(zoom, zFit) : zoom;
  const innerMinW = snapshotWidth * layoutScale;
  const innerMinH = snapshotHeight * layoutScale;
  const zoomVsFitLabel = zFit > 0 ? `${(zoom / zFit).toFixed(2)}× fit` : `${zoom.toFixed(2)}×`;


  function onCancel() {
    void dispatch({ type: EyedropperOverlayActionType.CancelButtonOnClick });
  }

  function onBackdropClick(_: MouseEvent<HTMLDivElement>) {
    onCancel();
  }

  function onOverlayWheelScroll(e: WheelEvent<HTMLDivElement>) {
    if (!isOpen || errorMessage !== null || !isLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const tw = snapshotWidth;
    const th = snapshotHeight;
    const anchor = clientToCanvasFloatClamped(e.clientX, e.clientY, canvas, tw, th);
    if (!anchor) return;
    e.preventDefault();
    const zf = zoomFitRef.current;
    if (zf <= 0) return;
    const z0 = zoomRef.current;
    const z1 = clampEyedropperZoomToFitRange(
      z0 * (e.deltaY < 0 ? EYEDROPPER_ZOOM_STEP : 1 / EYEDROPPER_ZOOM_STEP),
      zf,
    );
    if (Math.abs(z1 - z0) < 1e-9) return;
    wheelCorrectionRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      fx: anchor.fx,
      fy: anchor.fy,
    };
    eyedropperUiStore.setEyedropperZoom(z1);
  }

  function onErrorCancelButtonClick(_: MouseEvent<HTMLButtonElement>) {
    onCancel();
  }

  if (!isOpen) return null;

  return (
    <div
      className="eyedropper-overlay"
      onClick={onBackdropClick}
      onWheel={onOverlayWheelScroll}
    >
      <p className="eyedropper-instructions">
        Wheel: zoom {zoomVsFitLabel} (min 1x fit, max x{EYEDROPPER_ZOOM_MAX} fit) • Click to pick • Esc to cancel
        {previewHex && (
          <>
            <br />
            <span className="eyedropper-preview-hex">{previewHex}</span>
          </>
        )}
      </p>
      {!isLoaded && (
        <p className="eyedropper-loading">Capturing screen…</p>
      )}
      {errorMessage && (
        <div className="eyedropper-error">
          <p>Error rendering the screen snapshot.</p>
          <p className="eyedropper-error-detail">{errorMessage}</p>
          <button type="button" onClick={onErrorCancelButtonClick}>
            Close
          </button>
        </div>
      )}
      {isLoaded && (
        <div
          ref={scrollRef}
          className="eyedropper-overlay-scroll eyedropper-scroll"
          onScroll={onOverlayScroll}
        >
          <div
            className="eyedropper-inner"
            style={{
              minWidth: innerMinW,
              minHeight: innerMinH,
            }}
          >
            <EyedropperCanvas ref={canvasRef} />
          </div>
        </div>
      )}
      <EyedropperLoupe
        loupeCanvasRef={loupeCanvasRef}
        isOpen={isOpen}
        errorMessage={errorMessage}
        canvasRef={canvasRef}
      />
    </div>
  );
}

