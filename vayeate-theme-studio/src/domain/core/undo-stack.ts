import type { HistoryTransitionResult, UndoStackPosition } from '../../model/undo-history';
import type {
  PersistedStack,
  UndoAction,
  UndoFrame,
  UndoListEntry,
  UndoListResult,
  UndoProcessor,
  UndoStack,
  UndoStackOptions,
} from './undo-stack-types';
import { DEFAULT_DISK_MAX_FRAMES } from './undo-stack-types';

async function runApply(processor: UndoProcessor, actions: readonly UndoAction[]): Promise<void> {
  for (const action of actions) {
    await processor.applyProcessor(action);
  }
}

async function runRevert(processor: UndoProcessor, actions: readonly UndoAction[]): Promise<void> {
  for (let i = actions.length - 1; i >= 0; i--) {
    await processor.revertProcessor(actions[i]);
  }
}

function transitionResult(
  status: HistoryTransitionResult['status'],
  mode: HistoryTransitionResult['mode'],
  contextKey: string,
  entryId: string | null,
  message?: string,
): HistoryTransitionResult {
  return { status, mode, contextKey, entryId, message };
}

export function createStack(options: UndoStackOptions): UndoStack {
  const diskMaxFrames = options.diskMaxFrames ?? DEFAULT_DISK_MAX_FRAMES;
  let processor = options.processor;
  const onAfterChange = options.onAfterChange;
  const stackId = options.stackId ?? 'unknown';

  let frames: UndoFrame[] = [];
  let currentIndex = -1;

  function snapshot(): PersistedStack {
    return {
      frames: [...frames],
      currentId: currentIndex >= 0 ? frames[currentIndex]?.id ?? null : null,
    };
  }

  function restore(state: PersistedStack): void {
    frames = [...state.frames];
    currentIndex = state.currentId ? frames.findIndex((frame) => frame.id === state.currentId) : -1;
    if (currentIndex < -1) currentIndex = -1;
  }

  async function notifyChange(): Promise<void> {
    await onAfterChange?.();
  }

  function listEntries(): UndoListEntry[] {
    return frames.map((frame) => ({ id: frame.id, description: frame.description }));
  }

  function getPosition(): UndoStackPosition {
    const nextUndo = currentIndex >= 0 ? frames[currentIndex] : null;
    const nextRedo = currentIndex + 1 < frames.length ? frames[currentIndex + 1] : null;

    return {
      currentEntryId: currentIndex >= 0 ? frames[currentIndex]?.id ?? null : null,
      canUndo: nextUndo !== null,
      canRedo: nextRedo !== null,
      nextUndoEntryId: nextUndo?.id ?? null,
      nextRedoEntryId: nextRedo?.id ?? null,
    };
  }

  const stack: UndoStack = {
    async push(frame: UndoFrame): Promise<void> {
      const previous = snapshot();
      frames = frames.slice(0, currentIndex + 1);
      frames.push({ ...frame, persistenceStatus: 'persisted' });
      currentIndex = frames.length - 1;

      try {
        await notifyChange();
      } catch (error) {
        restore(previous);
        throw error;
      }
    },

    async undo(): Promise<HistoryTransitionResult> {
      if (currentIndex < 0) {
        return transitionResult('not-available', 'undo', stackId, null, 'No undo entry is available.');
      }

      const entry = frames[currentIndex];
      try {
        await runRevert(processor, entry.diffs);
        currentIndex -= 1;
        await notifyChange();
        return transitionResult('transitioned', 'undo', stackId, entry.id);
      } catch (error) {
        return transitionResult(
          'failed',
          'undo',
          stackId,
          entry.id,
          error instanceof Error ? error.message : 'Undo failed.',
        );
      }
    },

    async redo(): Promise<HistoryTransitionResult> {
      const entry = frames[currentIndex + 1];
      if (!entry) {
        return transitionResult('not-available', 'redo', stackId, null, 'No redo entry is available.');
      }

      try {
        await runApply(processor, entry.diffs);
        currentIndex += 1;
        await notifyChange();
        return transitionResult('transitioned', 'redo', stackId, entry.id);
      } catch (error) {
        return transitionResult(
          'failed',
          'redo',
          stackId,
          entry.id,
          error instanceof Error ? error.message : 'Redo failed.',
        );
      }
    },

    async goto(id: string): Promise<HistoryTransitionResult> {
      const targetIndex = frames.findIndex((frame) => frame.id === id);
      if (targetIndex < 0) {
        return transitionResult('not-available', 'go-to', stackId, id, 'The selected history entry is unavailable.');
      }

      const targetCurrentIndex = targetIndex - 1;
      if (currentIndex === targetCurrentIndex) {
        return transitionResult('transitioned', 'go-to', stackId, id);
      }

      const previousIndex = currentIndex;
      try {
        while (currentIndex > targetCurrentIndex) {
          await runRevert(processor, frames[currentIndex].diffs);
          currentIndex -= 1;
        }
        while (currentIndex < targetCurrentIndex) {
          const next = frames[currentIndex + 1];
          await runApply(processor, next.diffs);
          currentIndex += 1;
        }
        await notifyChange();
        return transitionResult('transitioned', 'go-to', stackId, id);
      } catch (error) {
        currentIndex = previousIndex;
        return transitionResult(
          'failed',
          'go-to',
          stackId,
          id,
          error instanceof Error ? error.message : 'History navigation failed.',
        );
      }
    },

    list(): UndoListResult {
      return {
        frames: listEntries(),
        currentId: currentIndex >= 0 ? frames[currentIndex]?.id ?? null : null,
      };
    },

    position(): UndoStackPosition {
      return getPosition();
    },

    availability(historyVersion: number) {
      const position = getPosition();
      return {
        activeContextKey: stackId,
        canUndo: position.canUndo,
        canRedo: position.canRedo,
        nextUndoDescription: currentIndex >= 0 ? frames[currentIndex]?.description ?? null : null,
        nextRedoDescription: currentIndex + 1 < frames.length ? frames[currentIndex + 1]?.description ?? null : null,
        recentActions: listEntries(),
        historyVersion,
      };
    },

    get canUndo(): boolean {
      return currentIndex >= 0;
    },

    get canRedo(): boolean {
      return currentIndex + 1 < frames.length;
    },

    getPersistedState(): PersistedStack {
      const capped = frames.length <= diskMaxFrames ? frames : frames.slice(-diskMaxFrames);
      const currentId = currentIndex >= 0 ? frames[currentIndex]?.id ?? null : null;
      return { frames: capped, currentId };
    },

    hydrate(persistedFrames: UndoFrame[], currentId: string | null): void {
      frames = [...persistedFrames];
      currentIndex = currentId ? frames.findIndex((frame) => frame.id === currentId) : -1;
      if (currentIndex < -1) currentIndex = -1;
    },

    setProcessor(nextProcessor: UndoProcessor): void {
      processor = nextProcessor;
    },
  };

  return stack;
}
