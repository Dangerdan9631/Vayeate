import { useEyedropperOverlayViewModel } from './use-eyedropper-overlay-viewmodel';
import { EYEDROPPER_LOUPE_SIZE } from './eyedropper-utils';

/** Full-screen screen snapshot overlay; driven by `state.ui.eyedropper`. */
export function EyedropperOverlay() {
  const vm = useEyedropperOverlayViewModel();
  const {
    isOpen,
    errorMessage,
    
    eyedropperSnapshot,
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
  } = vm;

  if (!isOpen) return null;

  const tw = eyedropperSnapshot?.fullBounds.width ?? 0;
  const th = eyedropperSnapshot?.fullBounds.height ?? 0;

  return (
    <div
      ref={overlayRootRef}
      className="eyedropper-overlay"
      onClick={onBackdropClick}
    >
      <p className="eyedropper-instructions">
        Wheel: zoom {zoomVsFitLabel} (min 1× fit, max ×{EYEDROPPER_ZOOM_MAX} fit) • Click to pick • Esc / backdrop to cancel
        {previewHex && (
          <>
            <br />
            <span className="eyedropper-preview-hex">{previewHex}</span>
          </>
        )}
      </p>
      {eyedropperSnapshot === null && (
        <p className="eyedropper-loading">Capturing screen…</p>
      )}
      {eyedropperSnapshot !== null && snapshotBitmapError && (
        <div className="eyedropper-error">
          <p>Could not draw the screen snapshot.</p>
          <p className="eyedropper-error-detail">{snapshotBitmapError}</p>
          <button type="button" onClick={onCancel}>
            Close
          </button>
        </div>
      )}
      {errorMessage && (
        <div className="eyedropper-error">
          <p>{errorMessage ?? 'Capture failed'}</p>
          <button type="button" onClick={onCancel}>
            Close
          </button>
        </div>
      )}
      {eyedropperSnapshot && !snapshotBitmapError && tw > 0 && th > 0 && (
        <div
          ref={scrollRef}
          className="eyedropper-overlay-scroll eyedropper-scroll"
        >
          <div
            className="eyedropper-inner"
            style={{
              minWidth: innerMinW,
              minHeight: innerMinH,
            }}
          >
            <canvas
              ref={canvasRef}
              role="img"
              aria-label="Screen snapshot — move to preview, click to pick a color"
              className="eyedropper-canvas"
              style={{
                width: canvasW,
                height: canvasH,
              }}
              onMouseMove={onCanvasMouseMove}
              onMouseLeave={onCanvasMouseLeave}
              onClick={onCanvasClick}
            />
          </div>
        </div>
      )}
      {loupePos && (
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
      )}
    </div>
  );
}
