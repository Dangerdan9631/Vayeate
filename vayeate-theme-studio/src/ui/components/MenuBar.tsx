import { useCallback, useEffect, useRef, useState } from 'react';
import { useColorScheme } from '../context/ColorSchemeContext';
import { useUndoStack } from '../context/UndoContext';
import { useAppDispatch, useAppDispatchV2 } from '../context/slice-contexts';

export function MenuBar() {
  const dispatch = useAppDispatch();
  const dispatchV2 = useAppDispatchV2();
  const { theme, toggleColorScheme } = useColorScheme();
  const { undo, redo, canUndo, canRedo, frames, currentId, goTo } = useUndoStack();
  const [fileOpen, setFileOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const fileRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fileOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (fileRef.current && !fileRef.current.contains(e.target as Node)) {
        setFileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [fileOpen]);

  useEffect(() => {
    if (!editOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (editRef.current && !editRef.current.contains(e.target as Node)) {
        setEditOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editOpen]);

  useEffect(() => {
    if (!historyOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setHistoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [historyOpen]);

  useEffect(() => {
    if (!viewOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (viewRef.current && !viewRef.current.contains(e.target as Node)) {
        setViewOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [viewOpen]);

  const handleUndo = useCallback(() => {
    undo();
    setEditOpen(false);
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
    setEditOpen(false);
  }, [redo]);

  const handleHistoryClick = useCallback(
    (frameId: string) => {
      goTo(frameId);
      setHistoryOpen(false);
    },
    [goTo],
  );

  const handleExit = useCallback(() => {
    dispatchV2({ type: 'APP_FILE_MENU_EXIT_BUTTON_ON_CLICK' });
    window.electronAPI?.closeWindow?.();
    setFileOpen(false);
  }, [dispatchV2]);

  const handleReload = useCallback(() => {
    dispatch({ type: 'VIEW_MENU_RELOAD_ON_CLICK' });
    dispatchV2({ type: 'APP_VIEW_MENU_RELOAD_BUTTON_ON_CLICK' });
    setViewOpen(false);
  }, [dispatch, dispatchV2]);

  const handleForceReload = useCallback(() => {
    dispatch({ type: 'VIEW_MENU_FORCE_RELOAD_ON_CLICK' });
    dispatchV2({ type: 'APP_VIEW_MENU_FORCE_RELOAD_BUTTON_ON_CLICK' });
    setViewOpen(false);
  }, [dispatch, dispatchV2]);

  const handleToggleDevTools = useCallback(() => {
    dispatch({ type: 'VIEW_MENU_TOGGLE_DEV_TOOLS_ON_CLICK' });
    dispatchV2({ type: 'APP_VIEW_MENU_TOGGLE_DEV_TOOLS_BUTTON_ON_CLICK' });
    setViewOpen(false);
  }, [dispatch, dispatchV2]);

  const handleMinimize = useCallback(() => {
    dispatchV2({ type: 'APP_BAR_MINIMIZE_BUTTON_ON_CLICK' });
    window.electronAPI?.minimizeWindow?.();
  }, [dispatchV2]);

  const handleMaximize = useCallback(() => {
    dispatchV2({ type: 'APP_BAR_MAXIMIZE_BUTTON_ON_CLICK' });
    window.electronAPI?.maximizeWindow?.();
  }, [dispatchV2]);

  const handleClose = useCallback(() => {
    dispatchV2({ type: 'APP_BAR_CLOSE_BUTTON_ON_CLICK' });
    window.electronAPI?.closeWindow?.();
  }, [dispatchV2]);

  const handleThemeToggle = useCallback(() => {
    dispatchV2({ type: 'APP_BAR_THEME_CHECKBOX_ON_TOGGLE', checked: theme !== 'light' });
    toggleColorScheme();
  }, [dispatchV2, theme, toggleColorScheme]);

  const handleTitleBarDrag = useCallback(() => {
    dispatchV2({ type: 'APP_BAR_TITLE_BAR_ON_DRAG' });
  }, [dispatchV2]);

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
            onClick={() => setFileOpen((o) => !o)}
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
            onClick={() => setEditOpen((o) => !o)}
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
            onClick={() => setHistoryOpen((o) => !o)}
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
                      onClick={() => handleHistoryClick(frame.id)}
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
            onClick={() => setViewOpen((o) => !o)}
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
