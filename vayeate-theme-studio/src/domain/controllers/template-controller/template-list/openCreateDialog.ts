import type { SetState } from '../../../operations/template-operations';
import { openTemplateCreateDialog } from '../template-details/openTemplateCreateDialog';

/** Open create dialog and reset form (V2: CREATE_BUTTON or CREATE_DIALOG_ON_OPEN). */
export function openCreateDialog(setState: SetState): void {
  openTemplateCreateDialog(setState);
}


