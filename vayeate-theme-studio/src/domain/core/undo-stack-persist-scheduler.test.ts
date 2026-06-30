import { describe, expect, it, vi } from 'vitest';
import { createUndoStackPersistScheduler } from './undo-stack-persist-scheduler';
import type { UndoPersistenceAdapter } from './undo-stack-types';

function createAdapter() {
  const saved = new Map<string, string>();
  const adapter: UndoPersistenceAdapter & { saved: Map<string, string> } = {
    saved,
    saveStack: vi.fn(async (stackId: string, payload: string) => {
      saved.set(stackId, payload);
    }),
    loadStack: vi.fn(async () => null),
    clearPersisted: vi.fn(async () => {
      saved.clear();
    }),
  };
  return adapter;
}

describe('undo stack persist scheduler', () => {
  it('serializes payload inside the persist job instead of when scheduling', async () => {
    const adapter = createAdapter();
    const getPayload = vi.fn(() => 'payload-1');
    const pendingRuns: Array<() => void | Promise<void>> = [];
    const scheduler = createUndoStackPersistScheduler((_description, run) => {
      pendingRuns.push(run);
    });

    scheduler.schedulePersist('stack-a', adapter, getPayload);
    expect(getPayload).not.toHaveBeenCalled();

    await pendingRuns[0]!();
    expect(getPayload).toHaveBeenCalled();
    expect(adapter.saved.get('stack-a')).toBe('payload-1');
  });

  it('coalesces multiple schedulePersist calls before the job runs into one enqueue and latest payload', async () => {
    const adapter = createAdapter();
    const pendingRuns: Array<() => void | Promise<void>> = [];
    const scheduler = createUndoStackPersistScheduler((_description, run) => {
      pendingRuns.push(run);
    });

    scheduler.schedulePersist('stack-a', adapter, () => 'payload-1');
    scheduler.schedulePersist('stack-a', adapter, () => 'payload-2');
    scheduler.schedulePersist('stack-a', adapter, () => 'payload-3');

    expect(pendingRuns).toHaveLength(1);
    expect(adapter.saveStack).not.toHaveBeenCalled();

    await pendingRuns[0]!();

    expect(adapter.saveStack).toHaveBeenCalledTimes(1);
    expect(adapter.saveStack).toHaveBeenCalledWith('stack-a', 'payload-3');
    expect(adapter.saved.get('stack-a')).toBe('payload-3');
  });

  it('saves again when payload changes while a persist job is in flight', async () => {
    const adapter = createAdapter();
    let releaseSave!: () => void;
    const saveGate = new Promise<void>((resolve) => {
      releaseSave = resolve;
    });
    adapter.saveStack = vi.fn(async (stackId: string, payload: string) => {
      await saveGate;
      adapter.saved.set(stackId, payload);
    });

    const pendingRuns: Array<() => void | Promise<void>> = [];
    const scheduler = createUndoStackPersistScheduler((_description, run) => {
      pendingRuns.push(run);
    });

    scheduler.schedulePersist('stack-a', adapter, () => 'payload-1');
    const jobPromise = pendingRuns[0]!();
    scheduler.schedulePersist('stack-a', adapter, () => 'payload-2');

    releaseSave();
    await jobPromise;

    expect(adapter.saveStack).toHaveBeenCalledTimes(2);
    expect(adapter.saveStack).toHaveBeenNthCalledWith(1, 'stack-a', 'payload-1');
    expect(adapter.saveStack).toHaveBeenNthCalledWith(2, 'stack-a', 'payload-2');
    expect(adapter.saved.get('stack-a')).toBe('payload-2');
  });

  it('flushPersist awaits the pending job for a stack', async () => {
    const adapter = createAdapter();
    let releaseSave!: () => void;
    const saveGate = new Promise<void>((resolve) => {
      releaseSave = resolve;
    });
    adapter.saveStack = vi.fn(async (stackId: string, payload: string) => {
      await saveGate;
      adapter.saved.set(stackId, payload);
    });

    const pendingRuns: Array<() => void | Promise<void>> = [];
    const scheduler = createUndoStackPersistScheduler((_description, run) => {
      pendingRuns.push(run);
    });

    scheduler.schedulePersist('stack-a', adapter, () => 'payload-1');
    const jobPromise = pendingRuns[0]!();
    const flushPromise = scheduler.flushPersist('stack-a');

    let flushSettled = false;
    void flushPromise.then(() => {
      flushSettled = true;
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(flushSettled).toBe(false);
    expect(adapter.saved.get('stack-a')).toBeUndefined();

    releaseSave();
    await Promise.all([jobPromise, flushPromise]);

    expect(adapter.saved.get('stack-a')).toBe('payload-1');
  });

  it('flushPersist resolves immediately when no persist is pending', async () => {
    const scheduler = createUndoStackPersistScheduler(() => {});
    await expect(scheduler.flushPersist('missing')).resolves.toBeUndefined();
  });

  it('flushAll awaits all pending jobs across stacks', async () => {
    const adapterA = createAdapter();
    const adapterB = createAdapter();
    let releaseSaves!: () => void;
    const saveGate = new Promise<void>((resolve) => {
      releaseSaves = resolve;
    });
    const gatedSave = vi.fn(async (stackId: string, payload: string) => {
      await saveGate;
      if (stackId === 'stack-a') {
        adapterA.saved.set(stackId, payload);
      } else {
        adapterB.saved.set(stackId, payload);
      }
    });
    adapterA.saveStack = gatedSave;
    adapterB.saveStack = gatedSave;

    const pendingRuns: Array<() => void | Promise<void>> = [];
    const scheduler = createUndoStackPersistScheduler((_description, run) => {
      pendingRuns.push(run);
    });

    scheduler.schedulePersist('stack-a', adapterA, () => 'payload-a');
    scheduler.schedulePersist('stack-b', adapterB, () => 'payload-b');
    const jobs = pendingRuns.map((run) => run());
    const flushPromise = scheduler.flushAll();

    let flushSettled = false;
    void flushPromise.then(() => {
      flushSettled = true;
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(flushSettled).toBe(false);
    expect(adapterA.saved.size).toBe(0);
    expect(adapterB.saved.size).toBe(0);

    releaseSaves();
    await Promise.all([...jobs, flushPromise]);

    expect(adapterA.saved.get('stack-a')).toBe('payload-a');
    expect(adapterB.saved.get('stack-b')).toBe('payload-b');
  });
});
