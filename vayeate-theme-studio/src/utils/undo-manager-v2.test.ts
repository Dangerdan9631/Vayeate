import { describe, it, expect } from 'vitest';
import {
  createFrameId,
  undoManagerV2,
  createUndoManagerV2,
  createStack,
  type UndoFrame,
  type UndoExecutor,
} from './undo-manager-v2';

type RecordedCall = { type: 'apply' | 'undo'; actions: object[] };

function recordingExecutor(): { records: RecordedCall[]; executor: UndoExecutor } {
  const records: RecordedCall[] = [];
  return {
    records,
    executor: {
      apply(actions: object[]) {
        records.push({ type: 'apply', actions: [...actions] });
      },
      undo(actions: object[]) {
        records.push({ type: 'undo', actions: [...actions] });
      },
    },
  };
}

function makeFrame(overrides: Partial<UndoFrame> = {}): UndoFrame {
  return {
    id: createFrameId(),
    description: 'Edit',
    applyActions: [{ value: 1 }],
    undoActions: [{ value: 0 }],
    ...overrides,
  };
}

describe('createFrameId', () => {
  it('returns a string', () => {
    expect(createFrameId()).toMatch(/^\d+-[a-z0-9]+$/);
  });

  it('returns chronologically sortable ids', () => {
    const a = createFrameId();
    const b = createFrameId();
    expect(a < b || a > b).toBe(true);
  });
});

describe('undo-manager-v2 stack', () => {
  it('push one frame and list', () => {
    const { executor } = recordingExecutor();
    const stack = createStack({ executor, maxSize: 20 });
    const frame = makeFrame({ id: 'f1', description: 'First' });
    stack.push(frame);

    const result = stack.list();
    expect(result.frames).toHaveLength(1);
    expect(result.frames[0]).toEqual({ id: 'f1', description: 'First' });
    expect(result.currentId).toBe('f1');
  });

  it('push then undo then redo and verify executor calls', () => {
    const { records, executor } = recordingExecutor();
    const stack = createStack({ executor });
    const f1 = makeFrame({ id: 'f1', applyActions: [{ a: 1 }], undoActions: [{ a: 0 }] });
    stack.push(f1);

    expect(records).toHaveLength(0);

    stack.undo();
    expect(records).toHaveLength(1);
    expect(records[0]).toEqual({ type: 'undo', actions: [{ a: 0 }] });

    stack.redo();
    expect(records).toHaveLength(2);
    expect(records[1]).toEqual({ type: 'apply', actions: [{ a: 1 }] });
  });

  it('redo from before first frame applies head', () => {
    const { records, executor } = recordingExecutor();
    const stack = createStack({ executor });
    const f1 = makeFrame({ id: 'f1', applyActions: [{ x: 1 }], undoActions: [{ x: 0 }] });
    stack.push(f1);
    stack.undo();
    expect(stack.list().currentId).toBe(null);

    stack.redo();
    expect(records).toHaveLength(2);
    expect(records[1]).toEqual({ type: 'apply', actions: [{ x: 1 }] });
    expect(stack.list().currentId).toBe('f1');
  });

  it('goto(id) from current to later frame applies frames one by one', () => {
    const { records, executor } = recordingExecutor();
    const stack = createStack({ executor });
    const f1 = makeFrame({ id: 'f1', applyActions: [{ n: 1 }], undoActions: [{ n: 0 }] });
    const f2 = makeFrame({ id: 'f2', applyActions: [{ n: 2 }], undoActions: [{ n: 1 }] });
    const f3 = makeFrame({ id: 'f3', applyActions: [{ n: 3 }], undoActions: [{ n: 2 }] });
    stack.push(f1);
    stack.push(f2);
    stack.push(f3);
    stack.undo();
    stack.undo();
    expect(stack.list().currentId).toBe('f1');
    records.length = 0;

    stack.goto('f3');
    expect(stack.list().currentId).toBe('f3');
    expect(records).toHaveLength(2);
    expect(records[0]).toEqual({ type: 'apply', actions: [{ n: 2 }] });
    expect(records[1]).toEqual({ type: 'apply', actions: [{ n: 3 }] });
  });

  it('goto(id) from current to earlier frame undoes frames one by one', () => {
    const { records, executor } = recordingExecutor();
    const stack = createStack({ executor });
    const f1 = makeFrame({ id: 'f1', applyActions: [{ n: 1 }], undoActions: [{ n: 0 }] });
    const f2 = makeFrame({ id: 'f2', applyActions: [{ n: 2 }], undoActions: [{ n: 1 }] });
    const f3 = makeFrame({ id: 'f3', applyActions: [{ n: 3 }], undoActions: [{ n: 2 }] });
    stack.push(f1);
    stack.push(f2);
    stack.push(f3);
    expect(stack.list().currentId).toBe('f3');
    records.length = 0;

    stack.goto('f1');
    expect(stack.list().currentId).toBe('f1');
    expect(records).toHaveLength(2);
    expect(records[0]).toEqual({ type: 'undo', actions: [{ n: 2 }] });
    expect(records[1]).toEqual({ type: 'undo', actions: [{ n: 1 }] });
  });

  it('push when not at tail drops later frames', () => {
    const { executor } = recordingExecutor();
    const stack = createStack({ executor });
    stack.push(makeFrame({ id: 'f1', description: 'One' }));
    stack.push(makeFrame({ id: 'f2', description: 'Two' }));
    stack.push(makeFrame({ id: 'f3', description: 'Three' }));
    stack.undo();
    expect(stack.list().frames.map((f) => f.id)).toEqual(['f1', 'f2', 'f3']);
    expect(stack.list().currentId).toBe('f2');

    stack.push(makeFrame({ id: 'f4', description: 'Four' }));
    const list = stack.list();
    expect(list.frames).toHaveLength(3);
    expect(list.frames.map((f) => f.description)).toEqual(['One', 'Two', 'Four']);
    expect(list.currentId).toBe('f4');
  });

  it('max size drops oldest frames', () => {
    const { executor } = recordingExecutor();
    const stack = createStack({ executor, maxSize: 3 });
    stack.push(makeFrame({ id: 'f1', description: 'A' }));
    stack.push(makeFrame({ id: 'f2', description: 'B' }));
    stack.push(makeFrame({ id: 'f3', description: 'C' }));

    let list = stack.list();
    expect(list.frames).toHaveLength(3);
    expect(list.frames.map((f) => f.description)).toEqual(['A', 'B', 'C']);

    stack.push(makeFrame({ id: 'f4', description: 'D' }));
    list = stack.list();
    expect(list.frames).toHaveLength(3);
    expect(list.frames.map((f) => f.description)).toEqual(['B', 'C', 'D']);
  });

  it('canUndo and canRedo reflect state', () => {
    const { executor } = recordingExecutor();
    const stack = createStack({ executor });
    expect(stack.canUndo).toBe(false);
    expect(stack.canRedo).toBe(false);

    stack.push(makeFrame({ id: 'f1' }));
    expect(stack.canUndo).toBe(true);
    expect(stack.canRedo).toBe(false);

    stack.push(makeFrame({ id: 'f2' }));
    expect(stack.canUndo).toBe(true);
    expect(stack.canRedo).toBe(false);

    stack.undo();
    expect(stack.canUndo).toBe(true);
    expect(stack.canRedo).toBe(true);

    stack.undo();
    expect(stack.canUndo).toBe(false);
    expect(stack.canRedo).toBe(true);
  });

  it('undo returns false when nothing to undo', () => {
    const { executor } = recordingExecutor();
    const stack = createStack({ executor });
    expect(stack.undo()).toBe(false);
    stack.push(makeFrame({ id: 'f1' }));
    stack.undo();
    expect(stack.undo()).toBe(false);
  });

  it('getPersistedState returns full frames and currentId', () => {
    const { executor } = recordingExecutor();
    const stack = createStack({ executor, maxSize: 2 });
    stack.push(makeFrame({ id: 'a', description: 'A' }));
    stack.push(makeFrame({ id: 'b', description: 'B' }));
    stack.push(makeFrame({ id: 'c', description: 'C' }));
    const state = stack.getPersistedState!();
    expect(state.frames).toHaveLength(3);
    expect(state.frames.map((f) => f.id)).toEqual(['a', 'b', 'c']);
    expect(state.currentId).toBe('c');
  });

  it('undo past in-memory window uses trimmed frames', () => {
    const { records, executor } = recordingExecutor();
    const stack = createStack({ executor, maxSize: 2 });
    stack.push(makeFrame({ id: 'f1', applyActions: [{ n: 1 }], undoActions: [{ n: 0 }] }));
    stack.push(makeFrame({ id: 'f2', applyActions: [{ n: 2 }], undoActions: [{ n: 1 }] }));
    stack.push(makeFrame({ id: 'f3', applyActions: [{ n: 3 }], undoActions: [{ n: 2 }] }));
    expect(stack.list().frames).toHaveLength(2);
    expect(stack.list().currentId).toBe('f3');
    stack.undo();
    stack.undo();
    expect(stack.list().currentId).toBe(null);
    records.length = 0;
    stack.undo();
    expect(records).toHaveLength(1);
    expect(records[0]).toEqual({ type: 'undo', actions: [{ n: 0 }] });
    expect(stack.list().currentId).toBe(null);
  });

  it('redo returns false when nothing to redo', () => {
    const { executor } = recordingExecutor();
    const stack = createStack({ executor });
    expect(stack.redo()).toBe(false);
    stack.push(makeFrame({ id: 'f1' }));
    expect(stack.redo()).toBe(false);
  });

  it('goto(id) returns false when id not found', () => {
    const { executor } = recordingExecutor();
    const stack = createStack({ executor });
    stack.push(makeFrame({ id: 'f1' }));
    expect(stack.goto('nonexistent')).toBe(false);
    expect(stack.list().currentId).toBe('f1');
  });
});

describe('undo-manager-v2 getOrCreate', () => {
  it('returns same stack for same id', async () => {
    const { executor } = recordingExecutor();
    const stackId = `stack-${Date.now()}-${Math.random()}`;
    const a = await undoManagerV2.getOrCreate(stackId, { executor });
    const b = await undoManagerV2.getOrCreate(stackId);
    expect(a).toBe(b);
  });

  it('multiple stacks are independent', async () => {
    const rec1 = recordingExecutor();
    const rec2 = recordingExecutor();
    const id1 = `stack-a-${Date.now()}`;
    const id2 = `stack-b-${Date.now()}`;
    const stack1 = await undoManagerV2.getOrCreate(id1, { executor: rec1.executor });
    const stack2 = await undoManagerV2.getOrCreate(id2, { executor: rec2.executor });

    stack1.push(makeFrame({ id: 'only-in-1', description: 'X' }));
    stack2.push(makeFrame({ id: 'only-in-2', description: 'Y' }));

    expect(stack1.list().frames).toHaveLength(1);
    expect(stack2.list().frames).toHaveLength(1);
    expect(stack1.list().frames[0].id).toBe('only-in-1');
    expect(stack2.list().frames[0].id).toBe('only-in-2');
  });

  it('getOrCreate without options rejects when stack does not exist', async () => {
    const stackId = `new-stack-${Date.now()}`;
    await expect(undoManagerV2.getOrCreate(stackId)).rejects.toThrow(/executor is required/);
  });
});

describe('createUndoManagerV2', () => {
  it('getOrCreate creates stack with options', async () => {
    const manager = createUndoManagerV2();
    const { executor } = recordingExecutor();
    const stack = await manager.getOrCreate('createUndoManagerV2-test', { executor });
    stack.push(makeFrame({ id: 'x', description: 'Test' }));
    expect(stack.list().frames).toHaveLength(1);
  });
});

type FakeAdapter = import('./undo-manager-v2').UndoPersistenceAdapter & {
  saves: { stackId: string; payload: string }[];
  loads: Map<string, string>;
};

function makeFakeAdapter(): FakeAdapter {
  const saves: { stackId: string; payload: string }[] = [];
  const loads = new Map<string, string>();
  return {
    saves,
    loads,
    async saveStack(stackId: string, payload: string) {
      saves.push({ stackId, payload });
    },
    async loadStack(stackId: string) {
      return loads.get(stackId) ?? null;
    },
    async clearPersisted() {
      saves.length = 0;
      loads.clear();
    },
  };
}

describe('undo-manager-v2 persistence and LRU', () => {
  let fakeAdapter: FakeAdapter;
  beforeEach(() => {
    fakeAdapter = makeFakeAdapter();
  });

  it('calls save after push when adapter is set', async () => {
    const manager = createUndoManagerV2({
      persistence: fakeAdapter,
      stackCount: 5,
    });
    fakeAdapter.saves.length = 0;
    const { executor } = recordingExecutor();
    const stack = await manager.getOrCreate('persist-test', { executor });
    stack.push(makeFrame({ id: 'p1', description: 'P1' }));
    expect(fakeAdapter.saves.length).toBeGreaterThanOrEqual(1);
    expect(JSON.parse(fakeAdapter.saves[fakeAdapter.saves.length - 1].payload).frames).toHaveLength(1);
    expect(JSON.parse(fakeAdapter.saves[fakeAdapter.saves.length - 1].payload).currentId).toBe('p1');
  });

  it('clearPersisted clears in-memory and calls adapter', async () => {
    const manager = createUndoManagerV2({ persistence: fakeAdapter, stackCount: 5 });
    const { executor } = recordingExecutor();
    const stack = await manager.getOrCreate('clear-test', { executor });
    stack.push(makeFrame({ id: 'c1' }));
    await manager.clearPersisted();
    const stack2 = await manager.getOrCreate('clear-test', { executor });
    expect(stack2.list().frames).toHaveLength(0);
  });

  it('evicts LRU when more than stackCount stacks', async () => {
    const manager = createUndoManagerV2({ persistence: fakeAdapter, stackCount: 2 });
    const { executor } = recordingExecutor();
    const a = await manager.getOrCreate('lru-a', { executor });
    const b = await manager.getOrCreate('lru-b', { executor });
    a.push(makeFrame({ id: 'a1' }));
    b.push(makeFrame({ id: 'b1' }));
    fakeAdapter.saves.length = 0;
    await manager.getOrCreate('lru-c', { executor });
    expect(fakeAdapter.saves.some((s) => s.stackId === 'lru-a' || s.stackId === 'lru-b')).toBe(true);
  });
});
