import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useContextSelector } from 'use-context-selector';
import { undoManagerV2 } from '../../../domain/core/undo-manager-v2';
import type { UndoListEntry } from '../../../domain/core/undo-manager-v2';
import { createUndoProcessor } from '../../../domain/core/undo-processor';
import { AppContext } from '../../core/components/AppProvider';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppActionType } from '../actions/app-action-type';

export interface MenuBarViewModel {
  fileOpen: boolean;
  editOpen: boolean;
  historyOpen: boolean;
  viewOpen: boolean;
  canUndo: boolean;
  canRedo: boolean;
  frames: UndoListEntry[];
  currentId: string | null;
  fileRef: RefObject<HTMLDivElement>;
  editRef: RefObject<HTMLDivElement>;
  historyRef: RefObject<HTMLDivElement>;
  viewRef: RefObject<HTMLDivElement>;
  themeToggleAriaLabel: string;
  themeToggleIcon: string;
  handleTitleBarDrag: () => void;
  handleThemeToggle: () => void;
  handleMinimize: () => void;
  handleMaximize: () => void;
  handleClose: () => void;
  handleFileMenuTrigger: () => void;
  handleEditMenuTrigger: () => void;
  handleHistoryMenuTrigger: () => void;
  handleViewMenuTrigger: () => void;
  handleExit: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleHistoryItemClick: (frameId: string) => () => void;
  handleReload: () => void;
  handleForceReload: () => void;
  handleToggleDevTools: () => void;
}

export function useMenuBarViewModel(): MenuBarViewModel {
  const dispatch = useAppDispatch();
  const currentStackId = useContextSelector(AppContext, (c) => c?.state.undoStack.currentUndoStackId);
  const undoListVersion = useContextSelector(AppContext, (c) => c?.state.undoStack.undoListVersion);
  const theme = useContextSelector(AppContext, (c) => c?.state.appConfig.colorScheme);
  const menuOpen = useContextSelector(AppContext, (c) => c?.state.ui.menuOpen);
  if (currentStackId === undefined || undoListVersion === undefined || theme === undefined || menuOpen === undefined) {
    throw new Error('useMenuBarViewModel must be used within AppProvider');
  }
  const { fileOpen, editOpen, historyOpen, viewOpen } = menuOpen;
  const [undoMenuState, setUndoMenuState] = useState<{
    frames: UndoListEntry[];
    currentId: string | null;
    canUndo: boolean;
    canRedo: boolean;
  }>({ frames: [], currentId: null, canUndo: false, canRedo: false });

  useEffect(() => {
    if (!currentStackId) {
      setUndoMenuState({ frames: [], currentId: null, canUndo: false, canRedo: false });
      return;
    }
    let cancelled = false;
    const processor = createUndoProcessor();
    undoManagerV2
      .getOrCreate(currentStackId, { processor })
      .then((stack) => {
        if (cancelled) return;
        const list = stack.list();
        setUndoMenuState({
          frames: list.frames,
          currentId: list.currentId,
          canUndo: stack.canUndo,
          canRedo: stack.canRedo,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setUndoMenuState({ frames: [], currentId: null, canUndo: false, canRedo: false });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [currentStackId, undoListVersion]);

  const { canUndo, canRedo, frames, currentId } = undoMenuState;
  const fileRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const isAnyMenuOpen = fileOpen || editOpen || historyOpen || viewOpen;

  useEffect(() => {
    if (!isAnyMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const targetNode = e.target as Node;
      const refs = [fileRef, editRef, historyRef, viewRef];
      const clickedInsideAnyMenu = refs.some((menuRef) => menuRef.current?.contains(targetNode));
      if (!clickedInsideAnyMenu) {
        void dispatch({ type: AppActionType.AppMenuOnClose });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dispatch, isAnyMenuOpen]);

  const handleUndo = useCallback(() => {
    void dispatch({ type: AppActionType.AppEditMenuUndoButtonOnClick });
    void dispatch({ type: AppActionType.AppMenuOnClose });
  }, [dispatch]);

  const handleRedo = useCallback(() => {
    void dispatch({ type: AppActionType.AppEditMenuRedoButtonOnClick });
    void dispatch({ type: AppActionType.AppMenuOnClose });
  }, [dispatch]);

  const handleHistoryClick = useCallback(
    (frameId: string) => {
      void dispatch({ type: AppActionType.AppHistoryMenuGoToButtonOnClick, frameId });
      void dispatch({ type: AppActionType.AppMenuOnClose });
    },
    [dispatch],
  );

  const handleHistoryItemClick = useCallback(
    (frameId: string) => () => {
      handleHistoryClick(frameId);
    },
    [handleHistoryClick],
  );

  const handleExit = useCallback(() => {
    void dispatch({ type: AppActionType.AppFileMenuExitButtonOnClick });
    void dispatch({ type: AppActionType.AppMenuOnClose });
  }, [dispatch]);

  const handleFileMenuTrigger = useCallback(() => {
    void dispatch({ type: AppActionType.AppFileMenuTriggerButtonOnClick });
  }, [dispatch]);

  const handleEditMenuTrigger = useCallback(() => {
    void dispatch({ type: AppActionType.AppEditMenuTriggerButtonOnClick });
  }, [dispatch]);

  const handleHistoryMenuTrigger = useCallback(() => {
    void dispatch({ type: AppActionType.AppHistoryMenuTriggerButtonOnClick });
  }, [dispatch]);

  const handleViewMenuTrigger = useCallback(() => {
    void dispatch({ type: AppActionType.AppViewMenuTriggerButtonOnClick });
  }, [dispatch]);

  const handleReload = useCallback(() => {
    void dispatch({ type: AppActionType.AppViewMenuReloadButtonOnClick });
    void dispatch({ type: AppActionType.AppMenuOnClose });
  }, [dispatch]);

  const handleForceReload = useCallback(() => {
    void dispatch({ type: AppActionType.AppViewMenuForceReloadButtonOnClick });
    void dispatch({ type: AppActionType.AppMenuOnClose });
  }, [dispatch]);

  const handleToggleDevTools = useCallback(() => {
    void dispatch({ type: AppActionType.AppViewMenuToggleDevToolsButtonOnClick });
    void dispatch({ type: AppActionType.AppMenuOnClose });
  }, [dispatch]);

  const handleMinimize = useCallback(() => {
    dispatch({ type: AppActionType.AppBarMinimizeButtonOnClick });
  }, [dispatch]);

  const handleMaximize = useCallback(() => {
    dispatch({ type: AppActionType.AppBarMaximizeButtonOnClick });
  }, [dispatch]);

  const handleClose = useCallback(() => {
    dispatch({ type: AppActionType.AppBarCloseButtonOnClick });
  }, [dispatch]);

  const handleThemeToggle = useCallback(() => {
    dispatch({ type: AppActionType.AppBarThemeCheckboxOnToggle, checked: theme !== 'light' });
  }, [dispatch, theme]);

  const handleTitleBarDrag = useCallback(() => {
    dispatch({ type: AppActionType.AppBarTitleBarOnDrag });
  }, [dispatch]);

  const { themeToggleAriaLabel, themeToggleIcon } = useMemo(() => {
    return {
      themeToggleAriaLabel: theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode',
      themeToggleIcon: theme === 'light' ? 'light_mode' : 'dark_mode',
    };
  }, [theme]);

  return {
    fileOpen,
    editOpen,
    historyOpen,
    viewOpen,
    canUndo,
    canRedo,
    frames,
    currentId,
    fileRef,
    editRef,
    historyRef,
    viewRef,
    themeToggleAriaLabel,
    themeToggleIcon,
    handleTitleBarDrag,
    handleThemeToggle,
    handleMinimize,
    handleMaximize,
    handleClose,
    handleFileMenuTrigger,
    handleEditMenuTrigger,
    handleHistoryMenuTrigger,
    handleViewMenuTrigger,
    handleExit,
    handleUndo,
    handleRedo,
    handleHistoryItemClick,
    handleReload,
    handleForceReload,
    handleToggleDevTools,
  };
}
