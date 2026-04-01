import { describe, it, expect, vi, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { InitializeWindowService } from './initializeWindowService';
import type { WindowService } from '../../../gateway/services/window-service';
import type {
  OnViewportResizeEventController,
  OnWindowMoveEventController,
  OnWindowResizeEventController,
  OnWindowStateEventController,
} from '../../controllers/window-controller';
import type { OnGlobalKeyDownEventController } from '../../controllers/app-controller';

describe('InitializeWindowService', () => {
  beforeEach(() => {
    container.clearInstances();
  });

  it('execute registers all callbacks through a single windowService.init call', () => {
    const init = vi.fn();
    const windowService = {
      init,
      dispose: vi.fn(),
    } as unknown as WindowService;

    const onWindowStateEvent = { run: vi.fn() } as unknown as OnWindowStateEventController;
    const onWindowResizeEvent = { run: vi.fn() } as unknown as OnWindowResizeEventController;
    const onWindowMoveEvent = { run: vi.fn() } as unknown as OnWindowMoveEventController;
    const onViewportResizeEvent = { run: vi.fn() } as unknown as OnViewportResizeEventController;
    const onGlobalKeyDownEvent = { run: vi.fn() } as unknown as OnGlobalKeyDownEventController;

    const op = new InitializeWindowService(
      windowService,
      onWindowStateEvent,
      onWindowResizeEvent,
      onWindowMoveEvent,
      onViewportResizeEvent,
      onGlobalKeyDownEvent,
    );
    op.execute();

    expect(init).toHaveBeenCalledTimes(1);
    const [callbacks] = init.mock.calls[0] as [Record<string, unknown>];
    const onState = callbacks.onStateEvent as (e: string) => void;
    const onResize = callbacks.onResize as (s: { width: number; height: number }) => void;
    const onMove = callbacks.onMove as (p: { x: number; y: number }) => void;

    onState('maximized');
    expect(onWindowStateEvent.run).toHaveBeenCalledWith('maximized');

    onResize({ width: 100, height: 200 });
    expect(onWindowResizeEvent.run).toHaveBeenCalledWith({ width: 100, height: 200 });

    onMove({ x: 5, y: 6 });
    expect(onWindowMoveEvent.run).toHaveBeenCalledWith({ x: 5, y: 6 });

    (callbacks.onViewportResize as (s: { width: number; height: number }) => void)({ width: 11, height: 22 });
    expect(onViewportResizeEvent.run).toHaveBeenCalledWith({ width: 11, height: 22 });

    (callbacks.onGlobalKeyDown as (e: KeyboardEvent) => void)(new KeyboardEvent('keydown', { key: 'y' }));
    expect(onGlobalKeyDownEvent.run).toHaveBeenCalled();
  });
});
