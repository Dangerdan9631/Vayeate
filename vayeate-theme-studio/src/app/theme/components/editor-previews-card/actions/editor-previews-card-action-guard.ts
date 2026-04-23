import type { AppAction } from '../../../../core/actions/app-action';
import { EditorPreviewsCardActions, EditorPreviewsCardActionType } from './editor-previews-card-action-type';

const editorPreviewsCardTypes = new Set<string>(Object.values(EditorPreviewsCardActionType));

export function isEditorPreviewsCardAction(a: AppAction): a is EditorPreviewsCardActions {
  return editorPreviewsCardTypes.has(a.type);
}
