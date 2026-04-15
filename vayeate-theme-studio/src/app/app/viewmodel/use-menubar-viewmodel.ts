import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react';
import { useContextSelector } from 'use-context-selector';
import type { UndoListEntry } from '../../../domain/core/undo-stack-types';
import { AppContext } from '../../core/app-context';
import { useAppDispatch } from '../../common/context/use-app-dispatch';
import { AppActionType } from '../actions/app-action-type';
import { UiStore } from '../../../domain/state/ui/ui-store';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { AppConfigStore } from '../../../domain/state/app-config/app-config-store';

const uiStore = container.resolve(UiStore);
const appConfigStore = container.resolve(AppConfigStore);

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
  const undoMenu = useContextSelector(AppContext, (c) => c?.state.undoStack.undoMenu);
  const theme = useStore(appConfigStore.api, (state) => state.config.colorScheme);
  const menuOpen = useStore(uiStore.api, (state) => state.state.menuOpen);
  if (
    currentStackId === undefined ||
    undoListVersion === undefined ||
    undoMenu === undefined ||
    theme === undefined ||
    menuOpen === undefined
  ) {
    throw new Error('useMenuBarViewModel must be used within AppProvider');
  }
  const { fileOpen, editOpen, historyOpen, viewOpen } = menuOpen;
  const { frames, currentId, canUndo, canRedo } = undoMenu;

  useEffect(() => {
    void dispatch({ type: AppActionType.AppMenubarUndoMenuSync });
  }, [currentStackId, undoListVersion, dispatch]);

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
    dispatch({ type: AppActionType.AppBarThemeCheckboxOnToggle });
  }, [dispatch]);

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
