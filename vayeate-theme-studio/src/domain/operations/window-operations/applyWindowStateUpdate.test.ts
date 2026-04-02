import { describe, it, expect, vi } from 'vitest';
import { ApplyWindowStateUpdateOperation } from './apply-window-state-update-operation';
import { WindowStateSetter } from '../../state/window/window-state-reducer';

describe('ApplyWindowStateUpdateOperation', () => {
  it('applies window slice updates through WindowStateSetter', () => {
    const apply = vi.fn();
    const setter = new WindowStateSetter(apply);
    const op = new ApplyWindowStateUpdateOperation(setter);
    op.execute({ type: 'SET_WINDOW_MAXIMIZED', value: true });
    expect(apply).toHaveBeenCalledWith({ type: 'SET_WINDOW_MAXIMIZED', value: true });
  });
});
