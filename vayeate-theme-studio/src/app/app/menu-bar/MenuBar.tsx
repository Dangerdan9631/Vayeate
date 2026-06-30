import type { MouseEvent } from 'react';
import { UNDO_BASELINE_FRAME_ID } from '../../../model/undo-history';
import { useMenuBarViewModel } from './use-menubar-viewmodel';

/**
 * Application menu bar with window controls, dropdown menus, and theme toggle.
 */
export function MenuBar() {
  const {
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
  } = useMenuBarViewModel();

  function onHistoryItemClick(event: MouseEvent<HTMLButtonElement>) {
    const frameId = event.currentTarget.dataset.frameId;
    if (!frameId) {
      return;
    }
    handleHistoryItemClick(frameId);
  }

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
            aria-label={themeToggleAriaLabel}
          >
            <span className="material-symbols-outlined" aria-hidden>
              {themeToggleIcon}
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
          {!isMaximized && (
          <button
            type="button"
            className="window-control window-control-maximize"
            onClick={handleMaximize}
            aria-label="Maximize"
          >
            <span className="material-symbols-outlined" aria-hidden>fit_screen</span>
          </button>
          )}
          {isMaximized && (
            <button
              type="button"
              className="window-control window-control-restore"
              onClick={handleRestore}
              aria-label="Restore"
            >
              <span className="material-symbols-outlined" aria-hidden>fullscreen_exit</span>
            </button>
          )}
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
                aria-label={nextUndoDescription ? `Undo ${nextUndoDescription}` : 'Undo'}
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
                aria-label={nextRedoDescription ? `Redo ${nextRedoDescription}` : 'Redo'}
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
                      data-frame-id={frame.id}
                      role="menuitem"
                      className={`menu-edit-history-item ${frame.id === currentId ? 'menu-edit-history-current' : ''} ${frame.id === UNDO_BASELINE_FRAME_ID ? 'menu-edit-history-baseline' : ''}`}
                      onClick={onHistoryItemClick}
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
