import type { Template } from '../../../model/schema/template-schemas';
import type { TemplateLifecycleUndoSnapshot } from '../../../model/template-undo-lifecycle';
import {
  TEMPLATE_CREATED,
  TEMPLATE_UNDO_ACTION_TYPES,
  TEMPLATE_VERSION_DELETED,
} from '../../../model/undo-action-types';
import type { UndoAction } from '../../core/undo-stack-types';
import type { UndoDiffHandler } from '../../core/undo-processor';
import type { ApplyTemplateLifecycleUndoOperation } from './apply-template-lifecycle-undo-operation';
import type { ApplyTemplateUndoStateOperation } from './apply-template-undo-state-operation';

const LIFECYCLE_ACTION_TYPES = new Set<string>([
  TEMPLATE_VERSION_DELETED,
  TEMPLATE_CREATED,
]);

/**
 * Input or state shape for template undo handler deps.
 */

export interface TemplateUndoHandlerDeps {
  applyTemplateUndoState: ApplyTemplateUndoStateOperation;
  applyTemplateLifecycleUndo: ApplyTemplateLifecycleUndoOperation;
}

/**
 * Builds template undo diff handlers for snapshot and lifecycle action types.
 * @param deps Operations used to apply template undo and lifecycle replay.
 * @returns Handler list wired for the universal undo processor.
 */

export function buildTemplateUndoHandlers(deps: TemplateUndoHandlerDeps): UndoDiffHandler[] {
  const snapshotHandlers = TEMPLATE_UNDO_ACTION_TYPES
    .filter((actionType) => !LIFECYCLE_ACTION_TYPES.has(actionType))
    .map((actionType) => ({
      actionType,
      apply: (action: UndoAction) => deps.applyTemplateUndoState.execute(action.after as Template),
      revert: (action: UndoAction) => deps.applyTemplateUndoState.execute(action.before as Template),
    }));

  const lifecycleHandlers: UndoDiffHandler[] = [
    {
      actionType: TEMPLATE_VERSION_DELETED,
      apply: (action) => deps.applyTemplateLifecycleUndo.applyVersionDeleted(
        action.before as TemplateLifecycleUndoSnapshot,
        action.after as TemplateLifecycleUndoSnapshot,
      ),
      revert: (action) => deps.applyTemplateLifecycleUndo.revertVersionDeleted(
        action.before as TemplateLifecycleUndoSnapshot,
      ),
    },
    {
      actionType: TEMPLATE_CREATED,
      apply: (action) => deps.applyTemplateLifecycleUndo.applyCreated(
        action.after as TemplateLifecycleUndoSnapshot,
      ),
      revert: (action) => deps.applyTemplateLifecycleUndo.revertCreated(
        action.before as TemplateLifecycleUndoSnapshot,
        action.after as TemplateLifecycleUndoSnapshot,
      ),
    },
  ];

  return [...snapshotHandlers, ...lifecycleHandlers];
}
