import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { useLazyEditorPreviewsCardViewModel } from './use-lazy-editor-previews-card-viewmodel';

const EditorPreviewsCard = lazy(async () => {
  const module = await import('./EditorPreviewsCard');
  return { default: module.EditorPreviewsCard };
});

type IdleHandle = number;

type IdleDeadlineLike = {
  didTimeout: boolean;
  timeRemaining: () => number;
};

type RequestIdleCallbackLike = (callback: (deadline: IdleDeadlineLike) => void) => IdleHandle;

type CancelIdleCallbackLike = (handle: IdleHandle) => void;

function getRequestIdleCallback(): RequestIdleCallbackLike | undefined {
  return window.requestIdleCallback as RequestIdleCallbackLike | undefined;
}

function getCancelIdleCallback(): CancelIdleCallbackLike | undefined {
  return window.cancelIdleCallback as CancelIdleCallbackLike | undefined;
}

function ThemePreviewsFallback() {
  return (
    <div className="tokens-card theme-previews-card" aria-busy="true">
      <h2>Editor Previews</h2>
      <div className="theme-preview-block">
        <span className="theme-preview-placeholder">Preparing previews…</span>
      </div>
    </div>
  );
}

export function LazyEditorPreviewsCard() {
  const { onPagePreviewsLoad } = useLazyEditorPreviewsCardViewModel();
  const hasQueuedPreviewLoadRef = useRef(false);
  const [shouldRenderEditorPreviews, setShouldRenderEditorPreviews] = useState(false);

  useEffect(() => {
    const requestIdle = getRequestIdleCallback();
    const cancelIdle = getCancelIdleCallback();

    if (requestIdle) {
      const idleHandle = requestIdle(() => {
        setShouldRenderEditorPreviews(true);
      });
      return () => {
        cancelIdle?.(idleHandle);
      };
    }

    const timeoutHandle = window.setTimeout(() => {
      setShouldRenderEditorPreviews(true);
    }, 0);
    return () => {
      window.clearTimeout(timeoutHandle);
    };
  }, []);

  useEffect(() => {
    if (!shouldRenderEditorPreviews || hasQueuedPreviewLoadRef.current) return;
    hasQueuedPreviewLoadRef.current = true;
    onPagePreviewsLoad();
  }, [onPagePreviewsLoad, shouldRenderEditorPreviews]);

  if (!shouldRenderEditorPreviews) {
    return <ThemePreviewsFallback />;
  }

  return (
    <Suspense fallback={<ThemePreviewsFallback />}>
      <EditorPreviewsCard />
    </Suspense>
  );
}
