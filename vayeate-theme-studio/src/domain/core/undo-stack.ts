import { UNDO_BASELINE_FRAME_ID, type HistoryTransitionResult, type UndoStackPosition } from '../../model/undo-history';
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

/**
 * Builds an in-memory undo stack that applies and reverts diffs through the supplied processor.
 *
 * @param options Stack identity, processor, optional change hook, and disk snapshot cap.
 * @returns An undo stack ready for push, undo, redo, and go-to transitions.
 */
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
    async push(frame: UndoFrame, coalesce): Promise<void> {
      const previous = snapshot();
      const canCoalesce = currentIndex === frames.length - 1;
      frames = frames.slice(0, currentIndex + 1);
      const nextFrame = { ...frame, persistenceStatus: 'persisted' as const };
      const current = currentIndex >= 0 ? frames[currentIndex] : null;
      if (canCoalesce && current && coalesce?.canMerge(current, nextFrame)) {
        const merged = coalesce.merge(current, nextFrame);
        if (merged) {
          frames[currentIndex] = { ...merged, persistenceStatus: 'persisted' };
        } else {
          frames.pop();
          currentIndex -= 1;
        }
      } else {
        frames.push(nextFrame);
        currentIndex = frames.length - 1;
      }

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
      const targetIndex = id === UNDO_BASELINE_FRAME_ID
        ? -1
        : frames.findIndex((frame) => frame.id === id);
      if (targetIndex < 0 && id !== UNDO_BASELINE_FRAME_ID) {
        return transitionResult('not-available', 'go-to', stackId, id, 'The selected history entry is unavailable.');
      }

      const targetCurrentIndex = targetIndex;
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
