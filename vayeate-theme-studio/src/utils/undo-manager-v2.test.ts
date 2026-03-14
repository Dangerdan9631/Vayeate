import { describe, it, expect } from 'vitest';
import {
  createFrameId,
  undoManagerV2,
  createUndoManagerV2,
  createStack,
  type UndoFrame,
  type UndoProcessor,
  type UndoAction,
} from './undo-manager-v2';

type RecordedCall = { type: 'apply' | 'revert'; action: UndoAction };

function recordingProcessor(): { records: RecordedCall[]; processor: UndoProcessor } {
  const records: RecordedCall[] = [];
  return {
    records,
    processor: {
      applyProcessor(action: UndoAction) {
        records.push({ type: 'apply', action: { ...action } });
        switch (action.type) {
          case 'NOOP':
            break;
          default:
            break;
        }
      },
      revertProcessor(action: UndoAction) {
        records.push({ type: 'revert', action: { ...action } });
        switch (action.type) {
          case 'NOOP':
            break;
          default:
            break;
        }
      },
    },
  };
}

function makeFrame(overrides: Partial<UndoFrame> = {}): UndoFrame {
  return {
    id: createFrameId(),
    description: 'Edit',
    actions: [{ type: 'NOOP' }],
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
    const { processor } = recordingProcessor();
    const stack = createStack({ processor, maxSize: 20 });
    const frame = makeFrame({ id: 'f1', description: 'First' });
    stack.push(frame);

    const result = stack.list();
    expect(result.frames).toHaveLength(1);
    expect(result.frames[0]).toEqual({ id: 'f1', description: 'First' });
    expect(result.currentId).toBe('f1');
  });

  it('push then undo then redo and verify processor calls', () => {
    const { records, processor } = recordingProcessor();
    const stack = createStack({ processor });
    const f1 = makeFrame({ id: 'f1' });
    stack.push(f1);

    expect(records).toHaveLength(0);

    stack.undo();
    expect(records).toHaveLength(1);
    expect(records[0].type).toBe('revert');
    expect(records[0].action.type).toBe('NOOP');

    stack.redo();
    expect(records).toHaveLength(2);
    expect(records[1].type).toBe('apply');
    expect(records[1].action.type).toBe('NOOP');
  });

  it('revert runs actions in reverse order', () => {
    const { records, processor } = recordingProcessor();
    const stack = createStack({ processor });
    const f1 = makeFrame({
      id: 'f1',
      actions: [{ type: 'NOOP' }, { type: 'NOOP' }],
    });
    stack.push(f1);
    stack.undo();
    expect(records).toHaveLength(2);
    expect(records[0].type).toBe('revert');
    expect(records[1].type).toBe('revert');
    expect(records[0].action.type).toBe('NOOP');
    expect(records[1].action.type).toBe('NOOP');
  });

  it('redo from before first frame applies head', () => {
    const { records, processor } = recordingProcessor();
    const stack = createStack({ processor });
    const f1 = makeFrame({ id: 'f1' });
    stack.push(f1);
    stack.undo();
    expect(stack.list().currentId).toBe(null);

    stack.redo();
    expect(records).toHaveLength(2);
    expect(records[1].type).toBe('apply');
    expect(records[1].action.type).toBe('NOOP');
    expect(stack.list().currentId).toBe('f1');
  });

  it('goto(id) from current to later frame applies frames one by one', () => {
    const { records, processor } = recordingProcessor();
    const stack = createStack({ processor });
    const f1 = makeFrame({ id: 'f1' });
    const f2 = makeFrame({ id: 'f2' });
    const f3 = makeFrame({ id: 'f3' });
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
    expect(records[0].type).toBe('apply');
    expect(records[1].type).toBe('apply');
    expect(records[0].action.type).toBe('NOOP');
    expect(records[1].action.type).toBe('NOOP');
  });

  it('goto(id) from current to earlier frame undoes frames one by one', () => {
    const { records, processor } = recordingProcessor();
    const stack = createStack({ processor });
    const f1 = makeFrame({ id: 'f1' });
    const f2 = makeFrame({ id: 'f2' });
    const f3 = makeFrame({ id: 'f3' });
    stack.push(f1);
    stack.push(f2);
    stack.push(f3);
    expect(stack.list().currentId).toBe('f3');
    records.length = 0;

    stack.goto('f1');
    expect(stack.list().currentId).toBe('f1');
    expect(records).toHaveLength(2);
    expect(records[0].type).toBe('revert');
    expect(records[1].type).toBe('revert');
    expect(records[0].action.type).toBe('NOOP');
    expect(records[1].action.type).toBe('NOOP');
  });

  it('push when not at tail drops later frames', () => {
    const { processor } = recordingProcessor();
    const stack = createStack({ processor });
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
    const { processor } = recordingProcessor();
    const stack = createStack({ processor, maxSize: 3 });
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
    const { processor } = recordingProcessor();
    const stack = createStack({ processor });
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
    const { processor } = recordingProcessor();
    const stack = createStack({ processor });
    expect(stack.undo()).toBe(false);
    stack.push(makeFrame({ id: 'f1' }));
    stack.undo();
    expect(stack.undo()).toBe(false);
  });

  it('getPersistedState returns full frames and currentId', () => {
    const { processor } = recordingProcessor();
    const stack = createStack({ processor, maxSize: 2 });
    stack.push(makeFrame({ id: 'a', description: 'A' }));
    stack.push(makeFrame({ id: 'b', description: 'B' }));
    stack.push(makeFrame({ id: 'c', description: 'C' }));
    const state = stack.getPersistedState!();
    expect(state.frames).toHaveLength(3);
    expect(state.frames.map((f) => f.id)).toEqual(['a', 'b', 'c']);
    expect(state.currentId).toBe('c');
  });

  it('undo past in-memory window uses trimmed frames', () => {
    const { records, processor } = recordingProcessor();
    const stack = createStack({ processor, maxSize: 2 });
    stack.push(makeFrame({ id: 'f1' }));
    stack.push(makeFrame({ id: 'f2' }));
    stack.push(makeFrame({ id: 'f3' }));
    expect(stack.list().frames).toHaveLength(2);
    expect(stack.list().currentId).toBe('f3');
    stack.undo();
    stack.undo();
    expect(stack.list().currentId).toBe(null);
    records.length = 0;
    stack.undo();
    expect(records).toHaveLength(1);
    expect(records[0].type).toBe('revert');
    expect(records[0].action.type).toBe('NOOP');
    expect(stack.list().currentId).toBe(null);
  });

  it('redo returns false when nothing to redo', () => {
    const { processor } = recordingProcessor();
    const stack = createStack({ processor });
    expect(stack.redo()).toBe(false);
    stack.push(makeFrame({ id: 'f1' }));
    expect(stack.redo()).toBe(false);
  });

  it('goto(id) returns false when id not found', () => {
    const { processor } = recordingProcessor();
    const stack = createStack({ processor });
    stack.push(makeFrame({ id: 'f1' }));
    expect(stack.goto('nonexistent')).toBe(false);
    expect(stack.list().currentId).toBe('f1');
  });
});

describe('undo-manager-v2 getOrCreate', () => {
  it('returns same stack for same id', async () => {
    const { processor } = recordingProcessor();
    const stackId = `stack-${Date.now()}-${Math.random()}`;
    const a = await undoManagerV2.getOrCreate(stackId, { processor });
    const b = await undoManagerV2.getOrCreate(stackId);
    expect(a).toBe(b);
  });

  it('multiple stacks are independent', async () => {
    const rec1 = recordingProcessor();
    const rec2 = recordingProcessor();
    const id1 = `stack-a-${Date.now()}`;
    const id2 = `stack-b-${Date.now()}`;
    const stack1 = await undoManagerV2.getOrCreate(id1, { processor: rec1.processor });
    const stack2 = await undoManagerV2.getOrCreate(id2, { processor: rec2.processor });

    stack1.push(makeFrame({ id: 'only-in-1', description: 'X' }));
    stack2.push(makeFrame({ id: 'only-in-2', description: 'Y' }));

    expect(stack1.list().frames).toHaveLength(1);
    expect(stack2.list().frames).toHaveLength(1);
    expect(stack1.list().frames[0].id).toBe('only-in-1');
    expect(stack2.list().frames[0].id).toBe('only-in-2');
  });

  it('getOrCreate without options rejects when stack does not exist', async () => {
    const stackId = `new-stack-${Date.now()}`;
    await expect(undoManagerV2.getOrCreate(stackId)).rejects.toThrow(/processor is required/);
  });
});

describe('createUndoManagerV2', () => {
  it('getOrCreate creates stack with options', async () => {
    const manager = createUndoManagerV2();
    const { processor } = recordingProcessor();
    const stack = await manager.getOrCreate('createUndoManagerV2-test', { processor });
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
    const { processor } = recordingProcessor();
    const stack = await manager.getOrCreate('persist-test', { processor });
    stack.push(makeFrame({ id: 'p1', description: 'P1' }));
    expect(fakeAdapter.saves.length).toBeGreaterThanOrEqual(1);
    expect(JSON.parse(fakeAdapter.saves[fakeAdapter.saves.length - 1].payload).frames).toHaveLength(1);
    expect(JSON.parse(fakeAdapter.saves[fakeAdapter.saves.length - 1].payload).currentId).toBe('p1');
  });

  it('clearPersisted clears in-memory and calls adapter', async () => {
    const manager = createUndoManagerV2({ persistence: fakeAdapter, stackCount: 5 });
    const { processor } = recordingProcessor();
    const stack = await manager.getOrCreate('clear-test', { processor });
    stack.push(makeFrame({ id: 'c1' }));
    await manager.clearPersisted();
    const stack2 = await manager.getOrCreate('clear-test', { processor });
    expect(stack2.list().frames).toHaveLength(0);
  });

  it('evicts LRU when more than stackCount stacks', async () => {
    const manager = createUndoManagerV2({ persistence: fakeAdapter, stackCount: 2 });
    const { processor } = recordingProcessor();
    const a = await manager.getOrCreate('lru-a', { processor });
    const b = await manager.getOrCreate('lru-b', { processor });
    a.push(makeFrame({ id: 'a1' }));
    b.push(makeFrame({ id: 'b1' }));
    fakeAdapter.saves.length = 0;
    await manager.getOrCreate('lru-c', { processor });
    expect(fakeAdapter.saves.some((s) => s.stackId === 'lru-a' || s.stackId === 'lru-b')).toBe(true);
  });
});
