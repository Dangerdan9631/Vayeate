import type { AppAction } from '../../../core/action-queue/app-action';

export enum EditorPreviewsCardActionType {
  PagePreviewsOnLoad = 'THEME_PAGE_PREVIEWS_ON_LOAD',
}

export type EditorPreviewsCardActions =
  | { type: EditorPreviewsCardActionType.PagePreviewsOnLoad };


const editorPreviewsCardTypes = new Set<string>(Object.values(EditorPreviewsCardActionType));

export function isEditorPreviewsCardAction(a: AppAction): a is EditorPreviewsCardActions {
  return editorPreviewsCardTypes.has(a.type);
}
