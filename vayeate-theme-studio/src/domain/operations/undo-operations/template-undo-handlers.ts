import type { Template } from '../../../model/schema/template-schemas';
import { TEMPLATE_UNDO_ACTION_TYPES } from '../../../model/undo-action-types';
import type { UndoDiffHandler } from '../../core/undo-processor';
import type { ApplyTemplateUndoStateOperation } from './apply-template-undo-state-operation';

export function buildTemplateUndoHandlers(
  applyTemplateUndoState: ApplyTemplateUndoStateOperation,
): UndoDiffHandler[] {
  return TEMPLATE_UNDO_ACTION_TYPES.map((actionType) => ({
    actionType,
    apply: (action) => applyTemplateUndoState.execute(action.after as Template),
    revert: (action) => applyTemplateUndoState.execute(action.before as Template),
  }));
}
