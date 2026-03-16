import { describe, it, expect, vi } from 'vitest';
import { createUndoProcessor } from './undo-processor';

describe('createUndoProcessor', () => {
  it('returns an object with applyProcessor and revertProcessor', () => {
    const setState = vi.fn();
    const processor = createUndoProcessor(setState);
    expect(typeof processor.applyProcessor).toBe('function');
    expect(typeof processor.revertProcessor).toBe('function');
  });

  it('applyProcessor does not call setState for NOOP action', () => {
    const setState = vi.fn();
    const processor = createUndoProcessor(setState);
    processor.applyProcessor({ type: 'NOOP' });
    expect(setState).not.toHaveBeenCalled();
  });

  it('revertProcessor does not call setState for NOOP action', () => {
    const setState = vi.fn();
    const processor = createUndoProcessor(setState);
    processor.revertProcessor({ type: 'NOOP' });
    expect(setState).not.toHaveBeenCalled();
  });

  it('applyProcessor does not throw for NOOP action', () => {
    const setState = vi.fn();
    const processor = createUndoProcessor(setState);
    expect(() => processor.applyProcessor({ type: 'NOOP' })).not.toThrow();
  });

  it('revertProcessor does not throw for NOOP action', () => {
    const setState = vi.fn();
    const processor = createUndoProcessor(setState);
    expect(() => processor.revertProcessor({ type: 'NOOP' })).not.toThrow();
  });
});
