import { useCallback, useEffect, useMemo, useState } from 'react';
import { undoManagerV2 } from '../../domain/core/undo-manager-v2';
import type { UndoListEntry } from '../../domain/core/undo-manager-v2';
import { createUndoProcessor } from '../../domain/core/undo-processor';
import { useAppState } from '../ui/context/app-context-hooks';
import { AppActionType } from '../actions/action-types';

export interface UndoStackViewModel {
  canUndo: boolean;
  canRedo: boolean;
  frames: UndoListEntry[];
  currentId: string | null;
  undo: () => void;
  redo: () => void;
  goTo: (frameId: string) => void;
}

/** Subscribes to the current undo stack for menu/history UI; must run under AppProvider. */
export function useUndoStackViewModel(): UndoStackViewModel {
  const { state, dispatch } = useAppState();
  const currentStackId = state.undoStack.currentUndoStackId;
  const undoListVersion = state.undoStack.undoListVersion;

  const [listState, setListState] = useState<{
    frames: UndoListEntry[];
    currentId: string | null;
    canUndo: boolean;
    canRedo: boolean;
  }>({ frames: [], currentId: null, canUndo: false, canRedo: false });

  useEffect(() => {
    if (!currentStackId) {
      setListState({ frames: [], currentId: null, canUndo: false, canRedo: false });
      return;
    }
    let cancelled = false;
    const processor = createUndoProcessor();
    undoManagerV2
      .getOrCreate(currentStackId, { processor })
      .then((stack) => {
        if (cancelled) return;
        const list = stack.list();
        setListState({
          frames: list.frames,
          currentId: list.currentId,
          canUndo: stack.canUndo,
          canRedo: stack.canRedo,
        });
      })
      .catch(() => {
        if (!cancelled) setListState({ frames: [], currentId: null, canUndo: false, canRedo: false });
      });
    return () => {
      cancelled = true;
    };
  }, [currentStackId, undoListVersion]);

  const undo = useCallback(() => {
    void dispatch({ type: AppActionType.AppEditMenuUndoButtonOnClick });
  }, [dispatch]);

  const redo = useCallback(() => {
    void dispatch({ type: AppActionType.AppEditMenuRedoButtonOnClick });
  }, [dispatch]);

  const goTo = useCallback(
    (frameId: string) => {
      void dispatch({ type: AppActionType.AppHistoryMenuGoToButtonOnClick, frameId });
    },
    [dispatch],
  );

  return useMemo(
    () => ({
      canUndo: listState.canUndo,
      canRedo: listState.canRedo,
      frames: listState.frames,
      currentId: listState.currentId,
      undo,
      redo,
      goTo,
    }),
    [listState.canUndo, listState.canRedo, listState.frames, listState.currentId, undo, redo, goTo],
  );
}
