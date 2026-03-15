import type { SetState } from '../../operations/template-operations';
import { closeTemplateCreateDialog } from './closeTemplateCreateDialog';

/** Close create dialog and clear form (V2: CANCEL_BUTTON). */
export function closeCreateDialog(setState: SetState): void {
  closeTemplateCreateDialog(setState);
}
