import { describe, it, expect, vi } from 'vitest';
import { InitializeWindowService } from './initializeWindowService';
import type { WindowService } from '../../../gateway/services/window-service';
import type { ApplyWindowStateUpdate } from '../window-operations';

describe('InitializeWindowService', () => {
  it('execute registers window IPC and forwards state, size, and position updates', () => {
    const apply = { execute: vi.fn() };
    const init = vi.fn();
    const windowService = { init } as unknown as WindowService;
    const op = new InitializeWindowService(
      windowService,
      apply as unknown as ApplyWindowStateUpdate,
    );
    op.execute();

    expect(init).toHaveBeenCalledTimes(1);
    const [onState, onResize, onMove] = init.mock.calls[0] as [
      (e: string) => void,
      (s: { width: number; height: number }) => void,
      (p: { x: number; y: number }) => void,
    ];

    onState('maximized');
    expect(apply.execute).toHaveBeenCalledWith({ type: 'SET_WINDOW_MAXIMIZED', value: true });

    onResize({ width: 100, height: 200 });
    expect(apply.execute).toHaveBeenCalledWith({
      type: 'SET_WINDOW_SIZE',
      size: { width: 100, height: 200 },
    });

    onMove({ x: 5, y: 6 });
    expect(apply.execute).toHaveBeenCalledWith({
      type: 'SET_WINDOW_POSITION',
      position: { x: 5, y: 6 },
    });
  });
});
