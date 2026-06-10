import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react';
import type { UndoHistoryListEntry } from '../../../model/undo-history';
import { useAppDispatch } from '../../core/action-queue/use-app-dispatch';
import { AppShellActionType } from '../app-shell/actions/app-shell-action-type';
import { AppMenuActionType } from './actions/app-menu-action-type';
import { UiStore } from '../../../domain/state/ui/ui-store';
import { container } from 'tsyringe';
import { useStore } from 'zustand';
import { AppConfigStore } from '../../../domain/state/data/app-config-store';
import { WindowStore } from '../../../domain/state/ui/window-store';
import { UndoStackStore } from '../../../domain/state/undo-stack/undo-stack-store';

const uiStore = container.resolve(UiStore);
const appConfigStore = container.resolve(AppConfigStore);
const undoStackStore = container.resolve(UndoStackStore);
const windowStore = container.resolve(WindowStore);

export interface MenuBarViewModel {
  fileOpen: boolean;
  editOpen: boolean;
  historyOpen: boolean;
  viewOpen: boolean;
  canUndo: boolean;
  canRedo: boolean;
  nextUndoDescription: string | null;
  nextRedoDescription: string | null;
  frames: UndoHistoryListEntry[];
  currentId: string | null;
  isMaximized: boolean;
  fileRef: RefObject<HTMLDivElement | null>;
  editRef: RefObject<HTMLDivElement | null>;
  historyRef: RefObject<HTMLDivElement | null>;
  viewRef: RefObject<HTMLDivElement | null>;
  themeToggleAriaLabel: string;
  themeToggleIcon: string;
  handleTitleBarDrag: () => void;
  handleThemeToggle: () => void;
  handleMinimize: () => void;
  handleMaximize: () => void;
  handleRestore: () => void;
  handleClose: () => void;
  handleFileMenuTrigger: () => void;
  handleEditMenuTrigger: () => void;
  handleHistoryMenuTrigger: () => void;
  handleViewMenuTrigger: () => void;
  handleExit: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleHistoryItemClick: (frameId: string) => void;
  handleReload: () => void;
  handleForceReload: () => void;
  handleToggleDevTools: () => void;
}

export function useMenuBarViewModel(): MenuBarViewModel {
  const dispatch = useAppDispatch();
  const isMaximized = useStore(windowStore.api, (state) => state.state.isMaximized);
  const undoMenu = useStore(undoStackStore.api, (state) => state.state.undoMenu);
  const theme = useStore(appConfigStore.api, (state) => state.config.colorScheme);
  const openMenu = useStore(uiStore.api, (state) => state.state.openMenu);
  const { frames, currentId, canUndo, canRedo, nextUndoDescription, nextRedoDescription } = undoMenu;

  const fileRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const isAnyMenuOpen = openMenu !== null;
  const fileOpen = openMenu === 'file';
  const editOpen = openMenu === 'edit';
  const historyOpen = openMenu === 'history';
  const viewOpen = openMenu === 'view';

  useEffect(() => {
    if (!isAnyMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const targetNode = e.target as Node;
      const refs = [fileRef, editRef, historyRef, viewRef];
      const clickedInsideAnyMenu = refs.some((menuRef) => menuRef.current?.contains(targetNode));
      if (!clickedInsideAnyMenu) {
        void dispatch({ type: AppMenuActionType.MenuOnClose });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dispatch, isAnyMenuOpen]);

  const handleUndo = useCallback(() => {
    void dispatch({ type: AppMenuActionType.EditMenuUndoButtonOnClick });
  }, [dispatch]);

  const handleRedo = useCallback(() => {
    void dispatch({ type: AppMenuActionType.EditMenuRedoButtonOnClick });
  }, [dispatch]);

  const handleHistoryItemClick = useCallback(
    (frameId: string) => {
      void dispatch({ type: AppMenuActionType.HistoryMenuGoToButtonOnClick, frameId });
    },
    [dispatch],
  );

  const handleExit = useCallback(() => {
    void dispatch({ type: AppMenuActionType.FileMenuExitButtonOnClick });
  }, [dispatch]);

  const handleFileMenuTrigger = useCallback(() => {
    void dispatch({ type: AppMenuActionType.FileMenuTriggerButtonOnClick });
  }, [dispatch]);

  const handleEditMenuTrigger = useCallback(() => {
    void dispatch({ type: AppMenuActionType.EditMenuTriggerButtonOnClick });
  }, [dispatch]);

  const handleHistoryMenuTrigger = useCallback(() => {
    void dispatch({ type: AppMenuActionType.HistoryMenuTriggerButtonOnClick });
  }, [dispatch]);

  const handleViewMenuTrigger = useCallback(() => {
    void dispatch({ type: AppMenuActionType.ViewMenuTriggerButtonOnClick });
  }, [dispatch]);

  const handleReload = useCallback(() => {
    void dispatch({ type: AppMenuActionType.ViewMenuReloadButtonOnClick });
  }, [dispatch]);

  const handleForceReload = useCallback(() => {
    void dispatch({ type: AppMenuActionType.ViewMenuForceReloadButtonOnClick });
  }, [dispatch]);

  const handleToggleDevTools = useCallback(() => {
    void dispatch({ type: AppMenuActionType.ViewMenuToggleDevToolsButtonOnClick });
  }, [dispatch]);

  const handleMinimize = useCallback(() => {
    dispatch({ type: AppShellActionType.MinimizeButtonOnClick });
  }, [dispatch]);

  const handleMaximize = useCallback(() => {
    dispatch({ type: AppShellActionType.MaximizeButtonOnClick });
  }, [dispatch]);

  const handleRestore = useCallback(() => {
    dispatch({ type: AppShellActionType.RestoreButtonOnClick });
  }, [dispatch]);

  const handleClose = useCallback(() => {
    dispatch({ type: AppShellActionType.CloseButtonOnClick });
  }, [dispatch]);

  const handleThemeToggle = useCallback(() => {
    dispatch({ type: AppShellActionType.ThemeCheckboxOnToggle });
  }, [dispatch]);

  const handleTitleBarDrag = useCallback(() => {
    dispatch({ type: AppShellActionType.TitleBarOnDrag });
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
    nextUndoDescription,
    nextRedoDescription,
    frames,
    currentId,
    isMaximized,
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
    handleRestore,
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
