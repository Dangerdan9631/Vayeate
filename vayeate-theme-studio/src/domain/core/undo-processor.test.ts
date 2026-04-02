import { describe, it, expect } from 'vitest';
import { createUndoProcessor } from './undo-processor';

describe('createUndoProcessor', () => {
  it('returns an object with applyProcessor and revertProcessor', () => {
    const processor = createUndoProcessor();
    expect(typeof processor.applyProcessor).toBe('function');
    expect(typeof processor.revertProcessor).toBe('function');
  });

  it('applyProcessor handles NOOP action', () => {
    const processor = createUndoProcessor();
    expect(() => processor.applyProcessor({ type: 'NOOP' })).not.toThrow();
  });

  it('revertProcessor handles NOOP action', () => {
    const processor = createUndoProcessor();
    expect(() => processor.revertProcessor({ type: 'NOOP' })).not.toThrow();
  });
});
