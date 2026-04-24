import { useCallback } from 'react';
import { useAppDispatch } from '../../../common/context/use-app-dispatch';
import { EditorPreviewsCardActionType } from './actions/editor-previews-card-action-type';

export interface LazyEditorPreviewsCardViewModel {
  onPagePreviewsLoad: () => void;
}

export function useLazyEditorPreviewsCardViewModel(): LazyEditorPreviewsCardViewModel {
  const dispatch = useAppDispatch();

  const onPagePreviewsLoad = useCallback(() => {
    void dispatch({ type: EditorPreviewsCardActionType.PagePreviewsOnLoad });
  }, [dispatch]);

  return {
    onPagePreviewsLoad,
  };
}
