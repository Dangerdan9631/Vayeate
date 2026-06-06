import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MenuBar } from './MenuBar';
import { ColorSchemeProvider } from '../app-shell/ColorSchemeProvider';

const viewModelMocks = vi.hoisted(() => ({
  useMenuBarViewModel: vi.fn(),
  useColorSchemeViewModel: vi.fn(),
}));

vi.mock('./use-menubar-viewmodel', () => ({
  useMenuBarViewModel: viewModelMocks.useMenuBarViewModel,
}));

vi.mock('../app-shell/use-color-scheme-viewmodel', () => ({
  useColorSchemeViewModel: viewModelMocks.useColorSchemeViewModel,
}));

describe('app session renderer workflows', () => {
  it('renders menu actions and routes window, history, and shell commands', async () => {
    const user = userEvent.setup();
    const callbacks = {
      handleTitleBarDrag: vi.fn(),
      handleThemeToggle: vi.fn(),
      handleMinimize: vi.fn(),
      handleMaximize: vi.fn(),
      handleRestore: vi.fn(),
      handleClose: vi.fn(),
      handleFileMenuTrigger: vi.fn(),
      handleEditMenuTrigger: vi.fn(),
      handleHistoryMenuTrigger: vi.fn(),
      handleViewMenuTrigger: vi.fn(),
      handleExit: vi.fn(),
      handleUndo: vi.fn(),
      handleRedo: vi.fn(),
      handleHistoryItemClick: vi.fn(),
      handleReload: vi.fn(),
      handleForceReload: vi.fn(),
      handleToggleDevTools: vi.fn(),
    };

    viewModelMocks.useMenuBarViewModel.mockReturnValue({
      fileOpen: true,
      editOpen: true,
      historyOpen: true,
      viewOpen: true,
      canUndo: true,
      canRedo: true,
      frames: [
        { id: 'a', description: 'Loaded template' },
        { id: 'b', description: 'Changed theme color' },
      ],
      currentId: 'b',
      isMaximized: false,
      fileRef: { current: null },
      editRef: { current: null },
      historyRef: { current: null },
      viewRef: { current: null },
      themeToggleAriaLabel: 'Switch to light mode',
      themeToggleIcon: 'dark_mode',
      ...callbacks,
    });

    const view = render(<MenuBar />);
    await user.click(view.getByRole('button', { name: 'Switch to light mode' }));
    await user.click(view.getByRole('button', { name: 'Minimize' }));
    await user.click(view.getByRole('button', { name: 'Maximize' }));
    await user.click(view.getByRole('button', { name: 'Close' }));
    await user.click(view.getByRole('menuitem', { name: 'Exit' }));
    await user.click(view.getByRole('menuitem', { name: 'Undo' }));
    await user.click(view.getByRole('menuitem', { name: 'Redo' }));
    await user.click(view.getByRole('menuitem', { name: 'Changed theme color' }));
    await user.click(view.getByRole('menuitem', { name: 'Reload' }));
    await user.click(view.getByRole('menuitem', { name: 'Force Reload' }));
    await user.click(view.getByRole('menuitem', { name: 'Toggle Developer Tools' }));

    expect(callbacks.handleThemeToggle).toHaveBeenCalledTimes(1);
    expect(callbacks.handleMinimize).toHaveBeenCalledTimes(1);
    expect(callbacks.handleMaximize).toHaveBeenCalledTimes(1);
    expect(callbacks.handleClose).toHaveBeenCalledTimes(1);
    expect(callbacks.handleExit).toHaveBeenCalledTimes(1);
    expect(callbacks.handleUndo).toHaveBeenCalledTimes(1);
    expect(callbacks.handleRedo).toHaveBeenCalledTimes(1);
    expect(callbacks.handleHistoryItemClick).toHaveBeenCalledWith('b');
    expect(callbacks.handleReload).toHaveBeenCalledTimes(1);
    expect(callbacks.handleForceReload).toHaveBeenCalledTimes(1);
    expect(callbacks.handleToggleDevTools).toHaveBeenCalledTimes(1);
  });

  it('applies the active color scheme to the document theme attribute', () => {
    viewModelMocks.useColorSchemeViewModel.mockReturnValue('light');
    render(
      <ColorSchemeProvider>
        <div>child</div>
      </ColorSchemeProvider>,
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
