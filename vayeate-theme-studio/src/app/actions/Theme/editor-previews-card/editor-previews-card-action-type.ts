import type { AppAction } from '../../../core/Queue/action-queue/app-action';

/**
 * Action type literals dispatched from the Editor Previews Card.
 */
export enum EditorPreviewsCardActionType {
  OpenInAppPreviewButtonOnClick = 'THEME_PREVIEW_OPEN_BUTTON_ON_CLICK',
  OpenPreviewHostButtonOnClick = 'THEME_PREVIEW_HOST_OPEN_BUTTON_ON_CLICK',
  PreviewScopeMapOnRequest = 'THEME_PAGE_PREVIEW_SCOPE_MAP_ON_REQUEST',
}

/**
 * Union of actions handled by the Editor Previews Card.
 */
export type EditorPreviewsCardActions =
  | { type: EditorPreviewsCardActionType.OpenInAppPreviewButtonOnClick }
  | { type: EditorPreviewsCardActionType.OpenPreviewHostButtonOnClick }
  | { type: EditorPreviewsCardActionType.PreviewScopeMapOnRequest };

const editorPreviewsCardTypes = new Set<string>(
  Object.values(EditorPreviewsCardActionType),
);

/**
 * Returns whether the app action belongs to the Editor Previews Card.
 * @param a Input for this call.
 */
export function isEditorPreviewsCardAction(
  a: AppAction,
): a is EditorPreviewsCardActions {
  return editorPreviewsCardTypes.has(a.type);
}
