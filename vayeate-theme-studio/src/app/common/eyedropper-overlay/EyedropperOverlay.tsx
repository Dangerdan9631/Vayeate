import { MouseEvent, useEffect, useLayoutEffect, useRef, WheelEvent } from 'react';
import { useEyedropperOverlayViewModel } from './use-eyedropper-overlay-viewmodel';
import { EyedropperCanvas } from './EyedropperCanvas';
import { EyedropperLoupe } from './EyedropperLoupe';
import {
  clampEyedropperCanvasInAspectBounds,
  clampEyedropperZoomToFitRange,
  clampElementScroll,
  clientToCanvasFloatClamped,
  EYEDROPPER_ZOOM_MAX,
  EYEDROPPER_ZOOM_STEP,
  scrollContainerContentSize,
} from './eyedropper-utils';
import type { Point } from '../../../model/point';

export function EyedropperOverlay() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loupeCanvasRef = useRef<HTMLCanvasElement>(null);
  const wheelCorrectionRef = useRef<{
    clientPosition: Point;
    canvasPosition: Point;
  } | null>(null);

  const {
    isOpen,
    isLoaded,
    errorMessage,
    previewHex,
    zoom,
    zoomFit,
    zoomVsFitLabel,
    innerSize,
    snapshotBounds,
    overlayViewportSize,
    onCancel,
    onOverlayWheelScroll: dispatchOverlayWheelScroll,
    onOverlayViewportSizeChange,
  } = useEyedropperOverlayViewModel();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onCancel]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isLoaded) return;

    const sync = () => {
      onOverlayViewportSizeChange(scrollContainerContentSize(el));
    };
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    sync();
    return () => ro.disconnect();
  }, [scrollRef, isLoaded, onOverlayViewportSizeChange]);

  useLayoutEffect(() => {
    onOverlayScroll();
  }, [overlayViewportSize, isOpen, snapshotBounds]);

  function onOverlayScroll() {
    const scroll = scrollRef.current;
    const canvas = canvasRef.current;
    if (!scroll || !canvas || !isOpen || errorMessage !== null || !isLoaded) return;
    clampEyedropperCanvasInAspectBounds(
      scroll,
      canvas,
      snapshotBounds.width,
      snapshotBounds.height,
    );
  }

  const zoomRef = useRef(zoom);
  const zoomFitRef = useRef(zoomFit);

  useEffect(() => {
    zoomRef.current = zoom;
    zoomFitRef.current = zoomFit;
  }, [zoom, zoomFit]);

  useLayoutEffect(() => {
    const corr = wheelCorrectionRef.current;
    if (!corr || !isOpen || errorMessage !== null || !isLoaded) return;
    const canvas = canvasRef.current;
    const scroll = scrollRef.current;
    if (!canvas || !scroll) return;
    const tw = snapshotBounds.width;
    const th = snapshotBounds.height;
    const cr = canvas.getBoundingClientRect();
    const px = cr.left + (corr.canvasPosition.x / tw) * cr.width;
    const py = cr.top + (corr.canvasPosition.y / th) * cr.height;
    scroll.scrollLeft -= corr.clientPosition.x - px;
    scroll.scrollTop -= corr.clientPosition.y - py;
    clampElementScroll(scroll);
    clampEyedropperCanvasInAspectBounds(scroll, canvas, tw, th);
    wheelCorrectionRef.current = null;
  }, [zoom, isOpen, isLoaded, errorMessage, snapshotBounds]);

  function onBackdropClick(_: MouseEvent<HTMLDivElement>) {
    onCancel();
  }

  function onOverlayWheelScroll(e: WheelEvent<HTMLDivElement>) {
    if (!isOpen || errorMessage !== null || !isLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const tw = snapshotBounds.width;
    const th = snapshotBounds.height;
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
      clientPosition: { x: e.clientX, y: e.clientY },
      canvasPosition: anchor,
    };
    dispatchOverlayWheelScroll(e.deltaY);
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
              minWidth: innerSize.width,
              minHeight: innerSize.height,
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

