import { describe, it, expect } from 'vitest';
import {
  createUndoStack,
  createFromSerializedState,
  type SerializedUndoState,
} from './undo-stack';

describe('undo-stack', () => {
  type State = { count: number; label: string };

  describe('getSerializableState / createFromSerializedState round-trip', () => {
    it('round-trips empty stack', () => {
      const stack = createUndoStack<State>({ count: 0, label: 'a' }, 50);
      const serialized = stack.getSerializableState();
      expect(serialized.base).toEqual({ count: 0, label: 'a' });
      expect(serialized.patches).toHaveLength(0);
      expect(serialized.currentIndex).toBe(-1);

      const restored = createFromSerializedState(serialized, 50);
      expect(restored.base).toEqual(stack.base);
      expect(restored.getState()).toEqual(stack.getState());
    });

    it('round-trips stack with one patch', () => {
      const stack = createUndoStack<State>({ count: 0, label: 'a' }, 50);
      stack.push('Edit', { count: 0, label: 'a' }, { count: 1, label: 'a' });
      const serialized = stack.getSerializableState();
      expect(serialized.patches).toHaveLength(1);
      expect(serialized.currentIndex).toBe(0);

      const restored = createFromSerializedState(serialized, 50);
      expect(restored.getState().currentIndex).toBe(0);
      expect(restored.getState().frames).toHaveLength(1);
      expect(restored.stateAt(0)).toEqual({ count: 1, label: 'a' });
    });

    it('round-trips stack with multiple patches and currentIndex in middle', () => {
      const stack = createUndoStack<State>({ count: 0, label: 'a' }, 50);
      stack.push('Step 1', { count: 0, label: 'a' }, { count: 1, label: 'a' });
      stack.push('Step 2', { count: 1, label: 'a' }, { count: 2, label: 'b' });
      stack.push('Step 3', { count: 2, label: 'b' }, { count: 3, label: 'b' });
      stack.undo();
      const serialized = stack.getSerializableState();
      expect(serialized.patches).toHaveLength(3);
      expect(serialized.currentIndex).toBe(1);

      const restored = createFromSerializedState(serialized, 50);
      expect(restored.getState().currentIndex).toBe(1);
      expect(restored.getState().canUndo).toBe(true);
      expect(restored.getState().canRedo).toBe(true);
      expect(restored.stateAt(1)).toEqual({ count: 2, label: 'b' });
    });
  });

  describe('createFromSerializedState', () => {
    it('produces stack that can undo/redo', () => {
      const serialized: SerializedUndoState<State> = {
        base: { count: 0, label: 'x' },
        patches: [
          { label: 'A', patch: { count: 1 } },
          { label: 'B', patch: { count: 2, label: 'y' } },
        ],
        currentIndex: 1,
      };
      const stack = createFromSerializedState(serialized, 50);
      expect(stack.stateAt(-1)).toEqual({ count: 0, label: 'x' });
      expect(stack.stateAt(0)).toEqual({ count: 1, label: 'x' });
      expect(stack.stateAt(1)).toEqual({ count: 2, label: 'y' });
      const afterUndo = stack.undo();
      expect(afterUndo).toEqual({ count: 1, label: 'x' });
      const afterRedo = stack.redo();
      expect(afterRedo).toEqual({ count: 2, label: 'y' });
    });
  });
});
