import { describe, expect, it, vi } from 'vitest';
import { UNDO_BASELINE_FRAME_ID } from '../../model/undo-history';
import { createStack } from './undo-stack';
import type { UndoFrame, UndoProcessor } from './undo-stack-types';

function frame(id: string, before: string, after: string): UndoFrame {
  return {
    id,
    contextKey: 'theme:one',
    description: `Set ${id}`,
    diffs: [{ actionType: 'set-value', target: 'value', before, after }],
    createdAtSessionOrder: Number(id.replace('f', '')),
    persistenceStatus: 'pending',
  };
}

function processor(state: { value: string }): UndoProcessor {
  return {
    applyProcessor(action): void {
      state.value = action.after as string;
    },
    revertProcessor(action): void {
      state.value = action.before as string;
    },
  };
}

describe('undo stack', () => {
  it('undoes in LIFO order and redoes in original order', async () => {
    const state = { value: 'a' };
    const stack = createStack({ stackId: 'theme:one', processor: processor(state) });

    await stack.push(frame('f1', 'a', 'b'));
    state.value = 'b';
    await stack.push(frame('f2', 'b', 'c'));
    state.value = 'c';

    expect(await stack.undo()).toMatchObject({ status: 'transitioned', entryId: 'f2' });
    expect(state.value).toBe('b');
    expect(await stack.undo()).toMatchObject({ status: 'transitioned', entryId: 'f1' });
    expect(state.value).toBe('a');
    expect(await stack.redo()).toMatchObject({ status: 'transitioned', entryId: 'f1' });
    expect(state.value).toBe('b');
    expect(await stack.redo()).toMatchObject({ status: 'transitioned', entryId: 'f2' });
    expect(state.value).toBe('c');
  });

  it('keeps at least 20 consecutive actions undoable', async () => {
    const state = { value: '0' };
    const stack = createStack({ stackId: 'theme:one', processor: processor(state) });

    for (let i = 1; i <= 20; i++) {
      await stack.push(frame(`f${i}`, String(i - 1), String(i)));
      state.value = String(i);
    }

    for (let i = 20; i >= 1; i--) {
      expect(await stack.undo()).toMatchObject({ status: 'transitioned', entryId: `f${i}` });
      expect(state.value).toBe(String(i - 1));
    }
  });

  it('prunes redoable branch entries when a new entry is pushed after undo', async () => {
    const state = { value: 'a' };
    const stack = createStack({ stackId: 'theme:one', processor: processor(state) });

    await stack.push(frame('f1', 'a', 'b'));
    state.value = 'b';
    await stack.push(frame('f2', 'b', 'c'));
    state.value = 'c';
    await stack.undo();

    await stack.push(frame('f3', 'b', 'd'));

    expect(stack.list().frames.map((entry) => entry.id)).toEqual(['f1', 'f3']);
    expect(stack.canRedo).toBe(false);
  });

  it('goes to the state immediately after the selected entry', async () => {
    const state = { value: 'a' };
    const stack = createStack({ stackId: 'theme:one', processor: processor(state) });

    await stack.push(frame('f1', 'a', 'b'));
    state.value = 'b';
    await stack.push(frame('f2', 'b', 'c'));
    state.value = 'c';
    await stack.push(frame('f3', 'c', 'd'));
    state.value = 'd';

    expect(await stack.goto('f2')).toMatchObject({ status: 'transitioned', entryId: 'f2' });
    expect(state.value).toBe('c');
    expect(stack.list().currentId).toBe('f2');

    expect(await stack.goto('f3')).toMatchObject({ status: 'transitioned', entryId: 'f3' });
    expect(state.value).toBe('d');
    expect(stack.list().currentId).toBe('f3');

    expect(await stack.goto('f2')).toMatchObject({ status: 'transitioned', entryId: 'f2' });
    expect(await stack.goto('f2')).toMatchObject({ status: 'transitioned', entryId: 'f2' });
    expect(state.value).toBe('c');
    expect(stack.list().currentId).toBe('f2');
  });

  it('goes to the baseline state when the baseline id is selected', async () => {
    const state = { value: 'a' };
    const stack = createStack({ stackId: 'theme:one', processor: processor(state) });

    await stack.push(frame('f1', 'a', 'b'));
    state.value = 'b';
    await stack.push(frame('f2', 'b', 'c'));
    state.value = 'c';

    expect(await stack.goto(UNDO_BASELINE_FRAME_ID)).toMatchObject({ status: 'transitioned' });
    expect(state.value).toBe('a');
    expect(stack.list().currentId).toBeNull();
    expect(stack.canRedo).toBe(true);
  });

  it('redoes forward from the baseline', async () => {
    const state = { value: 'a' };
    const stack = createStack({ stackId: 'theme:one', processor: processor(state) });

    await stack.push(frame('f1', 'a', 'b'));
    state.value = 'b';
    await stack.push(frame('f2', 'b', 'c'));
    state.value = 'c';

    await stack.goto(UNDO_BASELINE_FRAME_ID);
    expect(await stack.goto('f2')).toMatchObject({ status: 'transitioned', entryId: 'f2' });
    expect(state.value).toBe('c');
  });

  it('baseline goto is a no-op on a fresh stack', async () => {
    const processorSpy = vi.fn();
    const stack = createStack({
      stackId: 'theme:one',
      processor: {
        applyProcessor: processorSpy,
        revertProcessor: processorSpy,
      },
    });

    expect(await stack.goto(UNDO_BASELINE_FRAME_ID)).toMatchObject({ status: 'transitioned' });
    expect(processorSpy).not.toHaveBeenCalled();
  });

  it('rolls back a push when persistence fails', async () => {
    const stack = createStack({
      stackId: 'theme:one',
      processor: processor({ value: 'a' }),
      onAfterChange: vi.fn(async () => {
        throw new Error('disk full');
      }),
    });

    await expect(stack.push(frame('f1', 'a', 'b'))).rejects.toThrow('disk full');
    expect(stack.list().frames).toEqual([]);
  });
});

