import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { container } from 'tsyringe';
import { WindowService } from '../../../gateway/services/window-service';
import {
  SetWindowStateOperation,
  DragWindowOperation,
  ReloadWindowOperation,
  ToggleDevToolsOperation,
} from '.';

const windowServiceMock = {
  close: vi.fn(),
  minimize: vi.fn(),
  maximize: vi.fn(),
  restore: vi.fn(),
  drag: vi.fn(),
  reload: vi.fn(),
  reloadForce: vi.fn(),
  toggleDevTools: vi.fn(),
  init: vi.fn(),
  disposeIpcListeners: vi.fn(),
};

describe('window-operations', () => {
  beforeEach(() => {
    container.registerInstance(WindowService, windowServiceMock as unknown as WindowService);
    vi.mocked(windowServiceMock.close).mockResolvedValue(undefined);
    vi.mocked(windowServiceMock.minimize).mockResolvedValue(undefined);
    vi.mocked(windowServiceMock.maximize).mockResolvedValue(undefined);
    vi.mocked(windowServiceMock.restore).mockResolvedValue(undefined);
    vi.mocked(windowServiceMock.drag).mockResolvedValue(undefined);
    vi.mocked(windowServiceMock.reload).mockResolvedValue(undefined);
    vi.mocked(windowServiceMock.reloadForce).mockResolvedValue(undefined);
    vi.mocked(windowServiceMock.toggleDevTools).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ['close', 'close'] as const,
    ['minimize', 'minimize'] as const,
    ['maximize', 'maximize'] as const,
    ['restore', 'restore'] as const,
  ] as const)('SetWindowStateOperation execute(%s) calls windowService.%s', async (target, method) => {
    await container.resolve(SetWindowStateOperation).execute(target);
    expect(windowServiceMock[method]).toHaveBeenCalledTimes(1);
  });

  it('DragWindowOperation execute calls windowService.drag', async () => {
    await container.resolve(DragWindowOperation).execute();
    expect(windowServiceMock.drag).toHaveBeenCalledTimes(1);
  });

  it('ReloadWindowOperation execute(false) calls windowService.reload', async () => {
    await container.resolve(ReloadWindowOperation).execute(false);
    expect(windowServiceMock.reload).toHaveBeenCalledTimes(1);
    expect(windowServiceMock.reloadForce).not.toHaveBeenCalled();
  });

  it('ReloadWindowOperation execute(true) calls windowService.reloadForce', async () => {
    await container.resolve(ReloadWindowOperation).execute(true);
    expect(windowServiceMock.reloadForce).toHaveBeenCalledTimes(1);
    expect(windowServiceMock.reload).not.toHaveBeenCalled();
  });

  it('ReloadWindowOperation execute() defaults to windowService.reload', async () => {
    await container.resolve(ReloadWindowOperation).execute();
    expect(windowServiceMock.reload).toHaveBeenCalledTimes(1);
    expect(windowServiceMock.reloadForce).not.toHaveBeenCalled();
  });

  it('ToggleDevToolsOperation execute calls windowService.toggleDevTools', async () => {
    await container.resolve(ToggleDevToolsOperation).execute();
    expect(windowServiceMock.toggleDevTools).toHaveBeenCalledTimes(1);
  });
});
