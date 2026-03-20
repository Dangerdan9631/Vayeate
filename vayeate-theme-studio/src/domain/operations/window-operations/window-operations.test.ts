import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { windowService } from '../../../gateway/services/window-service';
import {
  CloseWindow,
  MaximizeWindow,
  RestoreWindow,
  MinimizeWindow,
  DragWindow,
  ReloadWindow,
  ToggleDevTools,
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

  it('CloseWindow execute calls windowService.close', async () => {
    await new CloseWindow().execute();
    expect(windowService.close).toHaveBeenCalledTimes(1);
  });

  it('MaximizeWindow execute calls windowService.maximize', async () => {
    await new MaximizeWindow().execute();
    expect(windowService.maximize).toHaveBeenCalledTimes(1);
  });

  it('RestoreWindow execute calls windowService.restore', async () => {
    await new RestoreWindow().execute();
    expect(windowService.restore).toHaveBeenCalledTimes(1);
  });

  it('MinimizeWindow execute calls windowService.minimize', async () => {
    await new MinimizeWindow().execute();
    expect(windowService.minimize).toHaveBeenCalledTimes(1);
  });

  it('DragWindow execute calls windowService.drag', async () => {
    await new DragWindow().execute();
    expect(windowService.drag).toHaveBeenCalledTimes(1);
  });

  it('ReloadWindow execute(false) calls windowService.reload', async () => {
    await new ReloadWindow().execute(false);
    expect(windowService.reload).toHaveBeenCalledTimes(1);
    expect(windowService.reloadForce).not.toHaveBeenCalled();
  });

  it('ReloadWindow execute(true) calls windowService.reloadForce', async () => {
    await new ReloadWindow().execute(true);
    expect(windowService.reloadForce).toHaveBeenCalledTimes(1);
    expect(windowService.reload).not.toHaveBeenCalled();
  });

  it('ReloadWindow execute() defaults to windowService.reload', async () => {
    await new ReloadWindow().execute();
    expect(windowService.reload).toHaveBeenCalledTimes(1);
    expect(windowService.reloadForce).not.toHaveBeenCalled();
  });

  it('ToggleDevTools execute calls windowService.toggleDevTools', async () => {
    await new ToggleDevTools().execute();
    expect(windowService.toggleDevTools).toHaveBeenCalledTimes(1);
  });
});
