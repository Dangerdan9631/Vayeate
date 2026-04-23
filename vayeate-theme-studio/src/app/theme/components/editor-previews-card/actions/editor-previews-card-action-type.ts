export enum EditorPreviewsCardActionType {
  PagePreviewsOnLoad = 'THEME_PAGE_PREVIEWS_ON_LOAD',
}

export type EditorPreviewsCardActions =
  | { type: EditorPreviewsCardActionType.PagePreviewsOnLoad };
