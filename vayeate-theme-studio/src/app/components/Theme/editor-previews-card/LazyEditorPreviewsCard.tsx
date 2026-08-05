import { Suspense, lazy } from 'react';
import { useLazyEditorPreviewsCardViewModel } from '../../../viewmodel/Theme/editor-previews-card/use-lazy-editor-previews-card-viewmodel';

const EditorPreviewsCard = lazy(async () => {
  const module = await import('./EditorPreviewsCard');
  return { default: module.EditorPreviewsCard };
});

function ThemePreviewsFallback() {
  return (
    <div className="theme-previews-content" aria-busy="true">
      <div className="theme-preview-block">
        <span className="theme-preview-placeholder">Preparing previews…</span>
      </div>
    </div>
  );
}

/**
 * Renders the Lazy Editor Previews Card UI for the theme editor.
 */
export function LazyEditorPreviewsCard() {
  const { isInAppPreviewOpen, isPreviewHostEnabled, isPreviewHostOpening, previewHostError, onOpenInAppPreviewClick, onOpenPreviewHostClick } = useLazyEditorPreviewsCardViewModel();

  function onPreviewButtonClick() {
    onOpenInAppPreviewClick();
  }

  function onPreviewHostButtonClick() {
    onOpenPreviewHostClick();
  }

  return (
    <div className="tokens-card theme-previews-card">
      <div className="theme-preview-toolbar">
        <h2>Editor Previews</h2>
        <div className="theme-preview-toolbar-actions">
          <button type="button" className="btn-primary" onClick={onPreviewButtonClick} disabled={isInAppPreviewOpen}>
            {isInAppPreviewOpen ? 'Preview Open' : 'Open Preview'}
          </button>
          <button type="button" className="btn-secondary" onClick={onPreviewHostButtonClick} disabled={isPreviewHostOpening}>
            {isPreviewHostOpening ? 'Opening Preview Host…' : isPreviewHostEnabled ? 'Open Preview Host Again' : 'Open Preview Host'}
          </button>
        </div>
      </div>
      {previewHostError && (
        <p className="theme-preview-error" role="alert">
          {previewHostError}
        </p>
      )}
      {isInAppPreviewOpen && (
        <Suspense fallback={<ThemePreviewsFallback />}>
          <EditorPreviewsCard />
        </Suspense>
      )}
    </div>
  );
}
