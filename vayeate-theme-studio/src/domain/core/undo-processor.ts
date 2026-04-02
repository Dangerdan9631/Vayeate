/**
 * Creates an UndoProcessor that applies/reverts UndoAction by updating app state.
 * Used when calling undoManagerV2.getOrCreate(stackId, { processor }).
 */

import type { UndoAction, UndoProcessor } from './undo-manager-v2';

export function createUndoProcessor(): UndoProcessor {
  return {
    applyProcessor(action: UndoAction): void {
      switch (action.type) {
        case 'NOOP':
          break;
        default:
          break;
      }
    },

    revertProcessor(action: UndoAction): void {
      switch (action.type) {
        case 'NOOP':
          break;
        default:
          break;
      }
    },
  };
}
