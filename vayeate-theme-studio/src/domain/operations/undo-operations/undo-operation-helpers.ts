import type { UndoProcessor, UndoStack } from '../../core/undo-stack-types';
import { undoManagerV2 } from '../../core/undo-manager-v2';
import {
  UNDO_BASELINE_FRAME_ID,
  type HistoryTransitionResult,
  type UndoHistoryListEntry,
} from '../../../model/undo-history';
import { emptyUndoMenuSnapshot, type UndoMenuSnapshot } from '../../state/undo-stack/undo-stack-state';
import type { UndoStackStore } from '../../state/undo-stack/undo-stack-store';

export function unavailableResult(
  mode: HistoryTransitionResult['mode'],
  contextKey: string | null,
  message: string,
): HistoryTransitionResult {
  return {
    status: 'not-available',
    mode,
    contextKey: contextKey ?? 'none',
    entryId: null,
    message,
  };
}

export function buildUndoMenuFrames(
  recentActions: readonly UndoHistoryListEntry[],
  baselineEntry: UndoHistoryListEntry,
): UndoHistoryListEntry[] {
  return [...recentActions].reverse().concat(baselineEntry);
}

export async function getActiveUndoStack(
  undoStackStore: UndoStackStore,
  processor: UndoProcessor,
): Promise<{ stackId: string; stack: UndoStack } | null> {
  const stackId = undoStackStore.getStore().state.currentUndoStackId;
  if (!stackId) return null;
  const stack = await undoManagerV2.getOrCreate(stackId, { processor });
  return { stackId, stack };
}

export function refreshUndoSummary(undoStackStore: UndoStackStore, stack: UndoStack | null): void {
  const store = undoStackStore.getStore();
  const nextVersion = (store.state.undoListVersion ?? 0) + 1;
  store.setUndoListVersion?.(nextVersion);

  if (!stack) {
    store.setUndoMenuSnapshot({ ...emptyUndoMenuSnapshot, historyVersion: nextVersion });
    return;
  }

  const list = stack.list();
  const availability = stack.availability?.(nextVersion) ?? {
    activeContextKey: store.state.currentUndoStackId,
    canUndo: stack.canUndo,
    canRedo: stack.canRedo,
    nextUndoDescription: null,
    nextRedoDescription: null,
    recentActions: list.frames,
    historyVersion: nextVersion,
  };
  const baselineLabel = store.state.currentBaselineLabel;
  const baselineEntry = { id: UNDO_BASELINE_FRAME_ID, description: baselineLabel };
  const snapshot: UndoMenuSnapshot = {
    ...availability,
    frames: buildUndoMenuFrames(availability.recentActions, baselineEntry),
    currentId: list.currentId ?? UNDO_BASELINE_FRAME_ID,
    baselineLabel,
  };
  store.setUndoMenuSnapshot(snapshot);
}
