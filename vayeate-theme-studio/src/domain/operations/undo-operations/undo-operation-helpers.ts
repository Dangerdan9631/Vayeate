import type { UndoProcessor, UndoStack } from '../../core/undo-stack-types';
import { undoManagerV2 } from '../../core/undo-manager-v2';
import {
  UNDO_BASELINE_FRAME_ID,
  type HistoryTransitionResult,
  type UndoHistoryListEntry,
} from '../../../model/undo-history';
import { emptyUndoMenuSnapshot, type UndoMenuSnapshot } from '../../state/undo-stack/undo-stack-state';
import type { UndoStackStore } from '../../state/undo-stack/undo-stack-store';

/**
 * Returns a not-available history transition result with a user-facing message.
 * @param mode Undo or redo mode that was requested.
 * @param contextKey Active undo stack id, if any.
 * @param message Reason the transition could not run.
 * @returns History transition payload marked not-available.
 */

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

/**
 * Orders undo menu frames with newest actions first and the baseline entry last.
 * @param recentActions Recent undo frames from the active stack.
 * @param baselineEntry Synthetic baseline frame shown at the bottom of the menu.
 * @returns Frame list for undo menu rendering.
 */

export function buildUndoMenuFrames(
  recentActions: readonly UndoHistoryListEntry[],
  baselineEntry: UndoHistoryListEntry,
): UndoHistoryListEntry[] {
  return [...recentActions].reverse().concat(baselineEntry);
}

/**
 * Resolves the currently selected undo stack from store state.
 * @param undoStackStore Store holding the active undo stack id.
 * @param processor Undo processor used when hydrating a stack instance.
 * @returns Active stack id and stack, or null when none is selected.
 */

export async function getActiveUndoStack(
  undoStackStore: UndoStackStore,
  processor: UndoProcessor,
): Promise<{ stackId: string; stack: UndoStack } | null> {
  const stackId = undoStackStore.getStore().state.currentUndoStackId;
  if (!stackId) return null;
  const stack = await undoManagerV2.getOrCreate(stackId, { processor });
  return { stackId, stack };
}

/**
 * Recomputes undo menu availability and frame list after a stack mutation.
 * @param undoStackStore Store receiving the updated undo menu snapshot.
 * @param stack Active undo stack, or null to clear menu state.
 * @returns Nothing; writes undo menu snapshot and list version to the store.
 */

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
