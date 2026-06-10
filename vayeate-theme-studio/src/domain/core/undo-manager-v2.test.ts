import { describe, expect, it, vi } from 'vitest';
import { createUndoManagerV2 } from './undo-manager-v2';
import type { UndoFrame, UndoPersistenceAdapter, UndoProcessor } from './undo-stack-types';

function frame(id: string): UndoFrame {
  return {
    id,
    contextKey: 'theme:one',
    description: `Set ${id}`,
    diffs: [{ actionType: 'set-value', target: 'value', before: 'a', after: id }],
    createdAtSessionOrder: 1,
    persistenceStatus: 'pending',
  };
}

function contextFrame(id: string, contextKey: string): UndoFrame {
  return {
    ...frame(id),
    contextKey,
  };
}

function processor(): UndoProcessor {
  return {
    applyProcessor: vi.fn(),
    revertProcessor: vi.fn(),
  };
}

function persistence(): UndoPersistenceAdapter & { saved: Map<string, string> } {
  const saved = new Map<string, string>();
  return {
    saved,
    saveStack: vi.fn(async (stackId: string, payload: string) => {
      saved.set(stackId, payload);
    }),
    loadStack: vi.fn(async (stackId: string) => saved.get(stackId) ?? null),
    clearPersisted: vi.fn(async () => {
      saved.clear();
    }),
  };
}

describe('undo manager v2', () => {
  it('writes stack changes through to persistence', async () => {
    const adapter = persistence();
    const manager = createUndoManagerV2({ persistence: adapter });
    const stack = await manager.getOrCreate('theme:one', { processor: processor() });

    await stack.push(frame('f1'));

    expect(adapter.saveStack).toHaveBeenCalledTimes(1);
    expect(JSON.parse(adapter.saved.get('theme:one') ?? '{}')).toMatchObject({
      currentId: 'f1',
      frames: [{ id: 'f1' }],
    });
  });

  it('reloads a released stack from active-session persistence', async () => {
    const adapter = persistence();
    const manager = createUndoManagerV2({ persistence: adapter });
    const stack = await manager.getOrCreate('theme:one', { processor: processor() });
    await stack.push(frame('f1'));

    await manager.release('theme:one');
    const reloaded = await manager.getOrCreate('theme:one', { processor: processor() });

    expect(reloaded.list()).toEqual({
      frames: [{ id: 'f1', description: 'Set f1' }],
      currentId: 'f1',
    });
  });

  it('preserves inactive stack entries during active stack transitions', async () => {
    const adapter = persistence();
    const manager = createUndoManagerV2({ persistence: adapter });
    const first = await manager.getOrCreate('theme:first', { processor: processor() });
    const second = await manager.getOrCreate('theme:second', { processor: processor() });

    await first.push(contextFrame('f1', 'theme:first'));
    await second.push(contextFrame('s1', 'theme:second'));
    await second.push(contextFrame('s2', 'theme:second'));

    await first.undo();

    expect(first.list()).toEqual({
      frames: [{ id: 'f1', description: 'Set f1' }],
      currentId: null,
    });
    expect(second.list()).toEqual({
      frames: [
        { id: 's1', description: 'Set s1' },
        { id: 's2', description: 'Set s2' },
      ],
      currentId: 's2',
    });
  });

  it('clears in-memory and persisted history for startup clearing', async () => {
    const adapter = persistence();
    const manager = createUndoManagerV2({ persistence: adapter });
    const stack = await manager.getOrCreate('theme:one', { processor: processor() });
    await stack.push(frame('f1'));

    await manager.clearPersisted();

    expect(adapter.clearPersisted).toHaveBeenCalledTimes(1);
    expect(adapter.saved.size).toBe(0);
    await expect(manager.getOrCreate('theme:one')).rejects.toThrow('processor is required');
  });

  it('surfaces persistence failures from stack changes', async () => {
    const adapter = persistence();
    adapter.saveStack = vi.fn(async () => {
      throw new Error('write failed');
    });
    const manager = createUndoManagerV2({ persistence: adapter });
    const stack = await manager.getOrCreate('theme:one', { processor: processor() });

    await expect(stack.push(frame('f1'))).rejects.toThrow('write failed');
    expect(stack.list().frames).toEqual([]);
  });
});
