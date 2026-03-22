import { describe, it, expect, vi } from 'vitest';
import { ApplyWindowStateUpdate } from './applyWindowStateUpdate';
import { WindowStateSetter } from '../../state/window-state-setter';

describe('ApplyWindowStateUpdate', () => {
  it('applies window slice updates through WindowStateSetter', () => {
    const apply = vi.fn();
    const setter = new WindowStateSetter(apply);
    const op = new ApplyWindowStateUpdate(setter);
    op.execute({ type: 'SET_WINDOW_MAXIMIZED', value: true });
    expect(apply).toHaveBeenCalledWith({ type: 'SET_WINDOW_MAXIMIZED', value: true });
  });
});
