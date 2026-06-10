import type { UndoAction, UndoProcessor } from './undo-stack-types';

export interface UndoDiffHandler {
  actionType: string;
  apply(action: UndoAction): Promise<void> | void;
  revert(action: UndoAction): Promise<void> | void;
}

export function createUndoProcessor(handlers: UndoDiffHandler[] = []): UndoProcessor {
  const handlersByType = new Map(handlers.map((handler) => [handler.actionType, handler]));

  function getHandler(action: UndoAction): UndoDiffHandler {
    const handler = handlersByType.get(action.actionType);
    if (!handler) {
      throw new Error(`No undo handler registered for action type: ${action.actionType}`);
    }
    return handler;
  }

  return {
    handlerCount: handlers.length,

    async applyProcessor(action: UndoAction): Promise<void> {
      await getHandler(action).apply(action);
    },

    async revertProcessor(action: UndoAction): Promise<void> {
      await getHandler(action).revert(action);
    },
  };
}
