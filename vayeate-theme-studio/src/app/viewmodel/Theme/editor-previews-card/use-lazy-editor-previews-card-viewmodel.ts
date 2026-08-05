import { useCallback } from 'react';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { useAppDispatch } from '../../../core/Queue/action-queue/use-app-dispatch';
import { EditorPreviewsCardActionType } from '../../../actions/Theme/editor-previews-card/editor-previews-card-action-type';
import { ThemePreviewStore } from '../../../../domain/state/Theme/ui/theme-preview-store';

const themePreviewStore = container.resolve(ThemePreviewStore);

/**
 * Read model returned by useLazyEditorPreviewsCardViewModel.
 */
export interface LazyEditorPreviewsCardViewModel {
  isInAppPreviewOpen: boolean;
  isPreviewHostEnabled: boolean;
  isPreviewHostOpening: boolean;
  previewHostError: string | null;
  onOpenInAppPreviewClick: () => void;
  onOpenPreviewHostClick: () => void;
}

/**
 * Exposes Editor Previews Card state and dispatches user or lifecycle actions.
 * @returns View-model state and action callbacks for the component.
 */
export function useLazyEditorPreviewsCardViewModel(): LazyEditorPreviewsCardViewModel {
  const dispatch = useAppDispatch();
  const isInAppPreviewOpen = useStore(
    themePreviewStore.api,
    (state) => state.state.isInAppPreviewOpen,
  );
  const isPreviewHostEnabled = useStore(
    themePreviewStore.api,
    (state) => state.state.isPreviewHostEnabled,
  );
  const isPreviewHostOpening = useStore(
    themePreviewStore.api,
    (state) => state.state.isPreviewHostOpening,
  );
  const previewHostError = useStore(
    themePreviewStore.api,
    (state) => state.state.previewHostError,
  );

  const onOpenInAppPreviewClick = useCallback(() => {
    void dispatch({
      type: EditorPreviewsCardActionType.OpenInAppPreviewButtonOnClick,
    });
  }, [dispatch]);

  const onOpenPreviewHostClick = useCallback(() => {
    void dispatch({
      type: EditorPreviewsCardActionType.OpenPreviewHostButtonOnClick,
    });
  }, [dispatch]);

  return {
    isInAppPreviewOpen,
    isPreviewHostEnabled,
    isPreviewHostOpening,
    previewHostError,
    onOpenInAppPreviewClick,
    onOpenPreviewHostClick,
  };
}
