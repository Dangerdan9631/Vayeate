import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { LoggerFactory } from '../../../domain/utils/logger';
import { AppShellHandler } from './actions/app-shell-handler';
import { AppShellActionType } from './actions/app-shell-action-type';
import { HandleKeyboardShortcutController } from './controllers/handle-keyboard-shortcut-controller';
import { useAppShellViewModel } from './use-app-shell-viewmodel';

const dispatchMock = vi.fn();
const useStoreMock = vi.fn();

vi.mock('../../core/action-queue/use-app-dispatch', () => ({
  useAppDispatch: () => dispatchMock,
}));

vi.mock('zustand', () => ({
  useStore: (...args: unknown[]) => useStoreMock(...args),
}));

function createLoggerFactory(): LoggerFactory {
  return {
    create: () => ({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      category: 'test',
    }),
  } as unknown as LoggerFactory;
}

function HookProbe() {
  const { activeTab } = useAppShellViewModel();
  return <div>{activeTab}</div>;
}

describe('app shell renderer workflows', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('dispatches lifecycle actions through the app action flow', () => {
    useStoreMock.mockImplementation((_api: unknown, selector: (state: { state: { activeTabId: string } }) => string) =>
      selector({ state: { activeTabId: 'themes' } }),
    );

    const view = render(<HookProbe />);

    expect(dispatchMock).toHaveBeenCalledWith({ type: AppShellActionType.PageOnLoad });
    expect(view.getByText('themes')).toBeInTheDocument();

    view.unmount();

    expect(dispatchMock).toHaveBeenCalledWith({ type: AppShellActionType.PageOnUnload });
  });

  it('routes shell lifecycle and window actions to focused controllers', async () => {
    const loadApp = { run: vi.fn() };
    const unloadApp = { run: vi.fn() };
    const closeWindow = { run: vi.fn() };
    const toggleColorScheme = { run: vi.fn() };
    const minimizeWindow = { run: vi.fn() };
    const maximizeWindow = { run: vi.fn() };
    const dragWindow = { run: vi.fn() };
    const restoreWindow = { run: vi.fn() };
    const handler = new AppShellHandler(
      loadApp as never,
      unloadApp as never,
      closeWindow as never,
      toggleColorScheme as never,
      minimizeWindow as never,
      maximizeWindow as never,
      dragWindow as never,
      restoreWindow as never,
      createLoggerFactory(),
    );

    await handler.handle({ type: AppShellActionType.PageOnLoad });
    await handler.handle({ type: AppShellActionType.ThemeCheckboxOnToggle });
    await handler.handle({ type: AppShellActionType.MinimizeButtonOnClick });
    await handler.handle({ type: AppShellActionType.MaximizeButtonOnClick });
    await handler.handle({ type: AppShellActionType.RestoreButtonOnClick });
    await handler.handle({ type: AppShellActionType.TitleBarOnDrag });
    await handler.handle({ type: AppShellActionType.CloseButtonOnClick });
    await handler.handle({ type: AppShellActionType.PageOnUnload });

    expect(loadApp.run).toHaveBeenCalledTimes(1);
    expect(toggleColorScheme.run).toHaveBeenCalledTimes(1);
    expect(minimizeWindow.run).toHaveBeenCalledTimes(1);
    expect(maximizeWindow.run).toHaveBeenCalledTimes(1);
    expect(restoreWindow.run).toHaveBeenCalledTimes(1);
    expect(dragWindow.run).toHaveBeenCalledTimes(1);
    expect(closeWindow.run).toHaveBeenCalledTimes(1);
    expect(unloadApp.run).toHaveBeenCalledTimes(1);
  });

  it('routes keyboard undo and redo shortcuts to typed history operations', async () => {
    const performUndo = { execute: vi.fn(async () => ({ status: 'transitioned' })) };
    const performRedo = { execute: vi.fn(async () => ({ status: 'transitioned' })) };
    const controller = new HandleKeyboardShortcutController(
      performUndo as never,
      performRedo as never,
    );
    const undoEvent = {
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
      key: 'z',
      preventDefault: vi.fn(),
    };
    const redoShiftEvent = {
      ctrlKey: true,
      metaKey: false,
      shiftKey: true,
      key: 'z',
      preventDefault: vi.fn(),
    };
    const redoEvent = {
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
      key: 'y',
      preventDefault: vi.fn(),
    };

    await controller.run(undoEvent);
    await controller.run(redoShiftEvent);
    await controller.run(redoEvent);

    expect(undoEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(redoShiftEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(redoEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(performUndo.execute).toHaveBeenCalledTimes(1);
    expect(performRedo.execute).toHaveBeenCalledTimes(2);
  });
});
