import { describe, it, expect, vi } from 'vitest';
import { OnWindowStateEventController } from './onWindowStateEvent';
import type { ApplyWindowStateUpdate } from '../../operations/window-operations';

describe('OnWindowStateEventController', () => {
  it.each([
    ['minimized', { type: 'SET_WINDOW_MINIMIZED', value: true }],
    ['maximized', { type: 'SET_WINDOW_MAXIMIZED', value: true }],
    ['unmaximized', { type: 'SET_WINDOW_MAXIMIZED', value: false }],
    ['restored', { type: 'SET_WINDOW_MINIMIZED', value: false }],
  ] as const)('maps %s to %o', (event, expected) => {
    const apply = { execute: vi.fn() } as unknown as ApplyWindowStateUpdate;
    const controller = new OnWindowStateEventController(apply);

    controller.run(event);

    expect(apply.execute).toHaveBeenCalledWith(expected);
  });
});

