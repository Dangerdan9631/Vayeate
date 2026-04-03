import { useCallback, useEffect, useRef } from 'react';
import { useColorScheme } from '../context/ColorSchemeContext';
import { useUndoStackViewModel } from '../../viewmodel/use-undo-stack-viewmodel';
import { useAppDispatch, useMenuOpenState } from '../context/slice-contexts';
import { AppActionType } from '../../actions/action-types';

export function MenuBar() {
  const dispatch = useAppDispatch();
  const { theme } = useColorScheme();
  const { fileOpen, editOpen, historyOpen, viewOpen } = useMenuOpenState();
  const { canUndo, canRedo, frames, currentId } = useUndoStackViewModel();
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

  return (
    <header className="menu-bar">
      <div className="menu-title-row">
        <div className="menu-title-block" onMouseDown={handleTitleBarDrag} role="presentation">
          <img src="/icon.png" alt="" className="menu-title-icon" width={20} height={20} />
          <span className="menu-title">Vayeate Theme Studio</span>
        </div>
        <div className="menu-theme-toggle-wrap">
          <button
            type="button"
            className="menu-theme-toggle"
            onClick={handleThemeToggle}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            <span className="material-symbols-outlined" aria-hidden>
              {theme === 'light' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
        <div className="window-controls">
          <button
            type="button"
            className="window-control window-control-minimize"
            onClick={handleMinimize}
            aria-label="Minimize"
          >
            <span className="material-symbols-outlined" aria-hidden>minimize</span>
          </button>
          <button
            type="button"
            className="window-control window-control-maximize"
            onClick={handleMaximize}
            aria-label="Maximize"
          >
            <span className="material-symbols-outlined" aria-hidden>crop_square</span>
          </button>
          <button
            type="button"
            className="window-control window-control-close"
            onClick={handleClose}
            aria-label="Close"
          >
            <span className="material-symbols-outlined" aria-hidden>close</span>
          </button>
        </div>
      </div>
      <nav className="menu-links">
        <div className="menu-edit-wrap" ref={fileRef}>
          <button
            type="button"
            className="menu-edit-trigger"
            onClick={handleFileMenuTrigger}
            aria-expanded={fileOpen}
            aria-haspopup="true"
            aria-label="File menu"
          >
            File
          </button>
          {fileOpen && (
            <div className="menu-edit-dropdown" role="menu">
              <button
                type="button"
                role="menuitem"
                className="menu-edit-item"
                onClick={handleExit}
                aria-label="Exit"
              >
                Exit
              </button>
            </div>
          )}
        </div>
        <div className="menu-edit-wrap" ref={editRef}>
          <button
            type="button"
            className="menu-edit-trigger"
            onClick={handleEditMenuTrigger}
            aria-expanded={editOpen}
            aria-haspopup="true"
            aria-label="Edit menu"
          >
            Edit
          </button>
          {editOpen && (
            <div className="menu-edit-dropdown" role="menu">
              <button
                type="button"
                role="menuitem"
                className="menu-edit-item"
                onClick={handleUndo}
                disabled={!canUndo}
                aria-label="Undo"
              >
                <span className="material-symbols-outlined menu-edit-icon" aria-hidden>undo</span>
                Undo
              </button>
              <button
                type="button"
                role="menuitem"
                className="menu-edit-item"
                onClick={handleRedo}
                disabled={!canRedo}
                aria-label="Redo"
              >
                <span className="material-symbols-outlined menu-edit-icon" aria-hidden>redo</span>
                Redo
              </button>
            </div>
          )}
        </div>
        <div className="menu-edit-wrap" ref={historyRef}>
          <button
            type="button"
            className="menu-edit-trigger"
            onClick={handleHistoryMenuTrigger}
            aria-expanded={historyOpen}
            aria-haspopup="true"
            aria-label="History menu"
          >
            History
          </button>
          {historyOpen && (
            <div className="menu-edit-dropdown" role="menu">
              {frames.length > 0 ? (
                <div className="menu-edit-history-list" role="group" aria-label="History">
                  {frames.map((frame) => (
                    <button
                      key={frame.id}
                      type="button"
                      role="menuitem"
                      className={`menu-edit-history-item ${frame.id === currentId ? 'menu-edit-history-current' : ''}`}
                      onClick={handleHistoryItemClick(frame.id)}
                    >
                      {frame.id === currentId && (
                        <span className="material-symbols-outlined menu-edit-history-check" aria-hidden>check</span>
                      )}
                      <span className="menu-edit-history-label-text">{frame.description}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="menu-edit-history-label" style={{ padding: '8px 12px' }}>
                  No history
                </div>
              )}
            </div>
          )}
        </div>
        <div className="menu-edit-wrap" ref={viewRef}>
          <button
            type="button"
            className="menu-edit-trigger"
            onClick={handleViewMenuTrigger}
            aria-expanded={viewOpen}
            aria-haspopup="true"
            aria-label="View menu"
          >
            View
          </button>
          {viewOpen && (
            <div className="menu-edit-dropdown" role="menu">
              <button
                type="button"
                role="menuitem"
                className="menu-edit-item"
                onClick={handleReload}
                aria-label="Reload"
              >
                Reload
              </button>
              <button
                type="button"
                role="menuitem"
                className="menu-edit-item"
                onClick={handleForceReload}
                aria-label="Force Reload"
              >
                Force Reload
              </button>
              <button
                type="button"
                role="menuitem"
                className="menu-edit-item"
                onClick={handleToggleDevTools}
                aria-label="Toggle Developer Tools"
              >
                Toggle Developer Tools
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
