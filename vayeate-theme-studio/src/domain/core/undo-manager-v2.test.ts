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
    await manager.flushPendingPersists();

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
    await manager.flushPendingPersists();

    await manager.release('theme:one');
    const reloaded = await manager.getOrCreate('theme:one', { processor: processor() });

    expect(reloaded.list()).toEqual({
      frames: [{ id: 'f1', description: 'Set f1' }],
      currentId: 'f1',
    });
  });

  it('awaits pending persistence before releasing a stack from memory', async () => {
    const adapter = persistence();
    let persistFinished = false;
    adapter.saveStack = vi.fn(async (stackId: string, payload: string) => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      adapter.saved.set(stackId, payload);
      persistFinished = true;
    });

    const pendingRuns: Array<() => void | Promise<void>> = [];
    const manager = createUndoManagerV2({
      persistence: adapter,
      persistEnqueue: (_description, run) => {
        pendingRuns.push(run);
      },
    });
    const stack = await manager.getOrCreate('theme:one', { processor: processor() });
    await stack.push(frame('f1'));
    expect(adapter.saveStack).not.toHaveBeenCalled();

    const releasePromise = manager.release('theme:one');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(adapter.saveStack).not.toHaveBeenCalled();
    expect(persistFinished).toBe(false);

    await pendingRuns[0]!();
    await releasePromise;

    expect(adapter.saveStack).toHaveBeenCalledTimes(1);
    expect(persistFinished).toBe(true);
    await expect(manager.getOrCreate('theme:one', { processor: processor() })).resolves.toBeDefined();
  });

  it('preserves inactive stack entries during active stack transitions', async () => {
    const adapter = persistence();
    const manager = createUndoManagerV2({ persistence: adapter });
    const first = await manager.getOrCreate('theme:first', { processor: processor() });
    const second = await manager.getOrCreate('theme:second', { processor: processor() });

    await first.push(contextFrame('f1', 'theme:first'));
    await second.push(contextFrame('s1', 'theme:second'));
    await second.push(contextFrame('s2', 'theme:second'));
    await manager.flushPendingPersists();

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
    await manager.flushPendingPersists();

    await manager.clearPersisted();

    expect(adapter.clearPersisted).toHaveBeenCalledTimes(1);
    expect(adapter.saved.size).toBe(0);
    await expect(manager.getOrCreate('theme:one')).rejects.toThrow('processor is required');
  });

  it('returns in-memory stacks from getIfLoaded without reading persistence', async () => {
    const adapter = persistence();
    const manager = createUndoManagerV2({ persistence: adapter });
    const stack = await manager.getOrCreate('theme:one', { processor: processor() });
    await stack.push(frame('f1'));
    vi.mocked(adapter.loadStack).mockClear();

    const loaded = manager.getIfLoaded('theme:one', { processor: processor() });

    expect(loaded).toBe(stack);
    expect(adapter.loadStack).not.toHaveBeenCalled();
    expect(manager.getIfLoaded('theme:missing', { processor: processor() })).toBeNull();
  });

  it('hydrates released stacks through hydrateFromPersistence', async () => {
    const adapter = persistence();
    const manager = createUndoManagerV2({ persistence: adapter });
    const stack = await manager.getOrCreate('theme:one', { processor: processor() });
    await stack.push(frame('f1'));
    await manager.flushPendingPersists();
    await manager.release('theme:one');

    const reloaded = await manager.hydrateFromPersistence('theme:one', { processor: processor() });

    expect(reloaded.list()).toEqual({
      frames: [{ id: 'f1', description: 'Set f1' }],
      currentId: 'f1',
    });
  });

  it('does not block stack changes when persistence fails asynchronously', async () => {
    const pendingRuns: Array<() => void | Promise<void>> = [];
    const adapter = persistence();
    adapter.saveStack = vi.fn(async () => {
      throw new Error('write failed');
    });
    const manager = createUndoManagerV2({
      persistence: adapter,
      persistEnqueue: (_description, run) => {
        pendingRuns.push(run);
      },
    });
    const stack = await manager.getOrCreate('theme:one', { processor: processor() });

    await stack.push(frame('f1'));
    expect(stack.list().frames).toEqual([{ id: 'f1', description: 'Set f1' }]);

    const persistPromise = manager.flushPendingPersists('theme:one');
    await expect(pendingRuns[0]!()).rejects.toThrow('write failed');
    await expect(persistPromise).rejects.toThrow('write failed');
    expect(stack.list().frames).toEqual([{ id: 'f1', description: 'Set f1' }]);
  });
});
