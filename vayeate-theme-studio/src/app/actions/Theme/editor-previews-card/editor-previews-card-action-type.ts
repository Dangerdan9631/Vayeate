import type { AppAction } from '../../../core/Common/action-queue/app-action';

/**
 * Action type literals dispatched from the Editor Previews Card.
 */
export enum EditorPreviewsCardActionType {
  PagePreviewsOnLoad = 'THEME_PAGE_PREVIEWS_ON_LOAD',
  PreviewScopeMapOnRequest = 'THEME_PAGE_PREVIEW_SCOPE_MAP_ON_REQUEST',
}

/**
 * Union of actions handled by the Editor Previews Card.
 */
export type EditorPreviewsCardActions =
  | { type: EditorPreviewsCardActionType.PagePreviewsOnLoad }
  | { type: EditorPreviewsCardActionType.PreviewScopeMapOnRequest };


const editorPreviewsCardTypes = new Set<string>(Object.values(EditorPreviewsCardActionType));

/**
 * Returns whether the app action belongs to the Editor Previews Card.
 * @param a Input for this call.
 */
export function isEditorPreviewsCardAction(a: AppAction): a is EditorPreviewsCardActions {
  return editorPreviewsCardTypes.has(a.type);
}
