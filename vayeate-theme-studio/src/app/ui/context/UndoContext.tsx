import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AppStateUpdate } from '../../../domain/state/app-state';
import { undoManagerV2 } from '../../../domain/core/undo-manager-v2';
import type { UndoListEntry } from '../../../domain/core/undo-manager-v2';
import { createUndoProcessor } from '../../../domain/core/undo-processor';
import { useAppState } from './useAppState';
import { AppActionType } from '../../actions/action-types';

export type SetState = (update: AppStateUpdate) => void;

export interface UndoStackValue {
  canUndo: boolean;
  canRedo: boolean;
  frames: UndoListEntry[];
  currentId: string | null;
  undo: () => void;
  redo: () => void;
  goTo: (frameId: string) => void;
}

const UndoContext = createContext<UndoStackValue | null>(null);

export function useUndoStack(): UndoStackValue {
  const ctx = useContext(UndoContext);
  if (!ctx) throw new Error('useUndoStack must be used within UndoProvider');
  return ctx;
}

export function UndoProvider({
  children,
  setState,
}: {
  children: ReactNode;
  setState: SetState;
}) {
  const { state, dispatch } = useAppState();
  const currentStackId = state.undoStackId.currentUndoStackId;
  const undoListVersion = state.undoStackId.undoListVersion;

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
    const processor = createUndoProcessor(setState);
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
  }, [currentStackId, undoListVersion, setState]);

  const undo = useCallback(() => {
    dispatch({ type: AppActionType.AppEditMenuUndoButtonOnClick });
  }, [dispatch]);

  const redo = useCallback(() => {
    dispatch({ type: AppActionType.AppEditMenuRedoButtonOnClick });
  }, [dispatch]);

  const goTo = useCallback(
    (frameId: string) => {
      dispatch({ type: AppActionType.AppHistoryMenuGoToButtonOnClick, frameId });
    },
    [dispatch],
  );

  const value = useMemo<UndoStackValue>(
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

  return <UndoContext.Provider value={value}>{children}</UndoContext.Provider>;
}
