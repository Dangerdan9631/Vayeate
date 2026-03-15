import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { windowService } from '../../../gateway/services/window-service';
import {
  closeWindow,
  maximizeWindow,
  restoreWindow,
  minimizeWindow,
  dragWindow,
  reloadWindow,
  toggleDevTools,
} from '.';

vi.mock('../../../gateway/services/window-service', () => ({
  windowService: {
    close: vi.fn(),
    minimize: vi.fn(),
    maximize: vi.fn(),
    restore: vi.fn(),
    drag: vi.fn(),
    reload: vi.fn(),
    reloadForce: vi.fn(),
    toggleDevTools: vi.fn(),
  },
}));

describe('window-operations', () => {
  beforeEach(() => {
    vi.mocked(windowService.close).mockResolvedValue(undefined);
    vi.mocked(windowService.minimize).mockResolvedValue(undefined);
    vi.mocked(windowService.maximize).mockResolvedValue(undefined);
    vi.mocked(windowService.restore).mockResolvedValue(undefined);
    vi.mocked(windowService.drag).mockResolvedValue(undefined);
    vi.mocked(windowService.reload).mockResolvedValue(undefined);
    vi.mocked(windowService.reloadForce).mockResolvedValue(undefined);
    vi.mocked(windowService.toggleDevTools).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('closeWindow calls windowService.close', async () => {
    await closeWindow();
    expect(windowService.close).toHaveBeenCalledTimes(1);
  });

  it('maximizeWindow calls windowService.maximize', async () => {
    await maximizeWindow();
    expect(windowService.maximize).toHaveBeenCalledTimes(1);
  });

  it('restoreWindow calls windowService.restore', async () => {
    await restoreWindow();
    expect(windowService.restore).toHaveBeenCalledTimes(1);
  });

  it('minimizeWindow calls windowService.minimize', async () => {
    await minimizeWindow();
    expect(windowService.minimize).toHaveBeenCalledTimes(1);
  });

  it('dragWindow calls windowService.drag', async () => {
    await dragWindow();
    expect(windowService.drag).toHaveBeenCalledTimes(1);
  });

  it('reloadWindow(false) calls windowService.reload', async () => {
    await reloadWindow(false);
    expect(windowService.reload).toHaveBeenCalledTimes(1);
    expect(windowService.reloadForce).not.toHaveBeenCalled();
  });

  it('reloadWindow(true) calls windowService.reloadForce', async () => {
    await reloadWindow(true);
    expect(windowService.reloadForce).toHaveBeenCalledTimes(1);
    expect(windowService.reload).not.toHaveBeenCalled();
  });

  it('reloadWindow() defaults to windowService.reload', async () => {
    await reloadWindow();
    expect(windowService.reload).toHaveBeenCalledTimes(1);
    expect(windowService.reloadForce).not.toHaveBeenCalled();
  });

  it('toggleDevTools calls windowService.toggleDevTools', async () => {
    await toggleDevTools();
    expect(windowService.toggleDevTools).toHaveBeenCalledTimes(1);
  });
});
