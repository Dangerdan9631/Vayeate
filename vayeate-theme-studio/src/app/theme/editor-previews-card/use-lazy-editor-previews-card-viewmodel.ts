import { useCallback } from 'react';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { EditorPreviewsCardActionType } from './actions/editor-previews-card-action-type';

/**
 * Read model returned by useLazyEditorPreviewsCardViewModel.
 */
export interface LazyEditorPreviewsCardViewModel {
  onPagePreviewsLoad: () => void;
}

/**
 * Exposes Editor Previews Card state and dispatches user or lifecycle actions.
 * @returns View-model state and action callbacks for the component.
 */
export function useLazyEditorPreviewsCardViewModel(): LazyEditorPreviewsCardViewModel {
  const dispatch = useAppDispatch();

  const onPagePreviewsLoad = useCallback(() => {
    void dispatch({ type: EditorPreviewsCardActionType.PagePreviewsOnLoad });
  }, [dispatch]);

  return {
    onPagePreviewsLoad,
  };
}
