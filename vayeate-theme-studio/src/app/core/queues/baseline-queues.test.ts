import { describe, expect, it, vi } from 'vitest';
import { ActionQueue } from '../action-queue/action-queue';
import { BackgroundQueue } from '../background-queue/background-queue';
import { KeyedDataIoQueue } from '../background-queue/keyed-data-io-queue';
import { PooledQueue } from '../background-queue/pooled-queue';
import { SerialQueue } from '../background-queue/serial-queue';
import { tryCoalesce, coalesceLatest, coalesceSumValue } from '../action-queue/action-coalescing-policy';
import { ThemePaletteCardActionType } from '../../theme/theme-palette-card/actions/theme-palette-card-action-type';
import type { LoggerFactory } from '../../../domain/utils/logger';
import type { AppAction } from '../action-queue/app-action';

type ActionWithValue<T> = AppAction & { value: T };
type ActionWithLabel = AppAction & { label: string };
type ActionWithCommit = AppAction & { committed: boolean };

function createLoggerFactory(): LoggerFactory {
  return {
    create: () => ({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      category: 'test',
    }),
  } as unknown as LoggerFactory;
}

describe('queue baselines', () => {
  it('processes action queue items in order and signals completion', async () => {
    const processed: string[] = [];
    const actionProcessor = {
      process: vi.fn(async (action: AppAction) => {
        processed.push(action.type);
      }),
    };
    const updateActionQueueStatus = { run: vi.fn() };
    const signalActionQueueProcessingComplete = { run: vi.fn() };

    const queue = new ActionQueue(
      actionProcessor as never,
      updateActionQueueStatus as never,
      signalActionQueueProcessingComplete as never,
      createLoggerFactory(),
    );

    queue.enqueue({ type: 'FIRST_ACTION' } as unknown as AppAction);
    queue.enqueue({ type: 'SECOND_ACTION' } as unknown as AppAction);

    await vi.waitFor(() => {
      expect(processed).toEqual(['FIRST_ACTION', 'SECOND_ACTION']);
    });
    expect(updateActionQueueStatus.run).toHaveBeenCalledTimes(2);
    expect(signalActionQueueProcessingComplete.run).toHaveBeenCalledTimes(1);
  });

  it('routes background work to the selected queue type', () => {
    const mainQueue = { enqueue: vi.fn() };
    const deferredQueue = { enqueue: vi.fn() };
    const dataIoQueue = { enqueue: vi.fn() };

    const queue = new BackgroundQueue(
      mainQueue as never,
      deferredQueue as never,
      dataIoQueue as never,
      createLoggerFactory(),
    );

    queue.enqueue('deferred', 'tokenize', () => {});
    queue.enqueue('data_io', 'persist', () => {});
    queue.enqueue('main', 'hydrate', () => {});

    expect(deferredQueue.enqueue).toHaveBeenCalledWith('tokenize', expect.any(Function), undefined);
    expect(dataIoQueue.enqueue).toHaveBeenCalledWith('persist', expect.any(Function), undefined);
    expect(mainQueue.enqueue).toHaveBeenCalledWith('hydrate', expect.any(Function), undefined);
  });

  it('runs serial queue work one item at a time and completes even after errors', async () => {
    const steps: string[] = [];
    const serialQueue = new SerialQueue(
      'main',
      { run: vi.fn() } as never,
      { run: vi.fn((_queueType: string, descriptions: string[]) => steps.push(`status:${descriptions[0]}`)) } as never,
      { run: vi.fn(() => steps.push('complete')) } as never,
      createLoggerFactory(),
    );

    serialQueue.enqueue('first', async () => {
      steps.push('run:first');
    });
    serialQueue.enqueue('second', async () => {
      steps.push('run:second');
      throw new Error('expected');
    });

    await vi.waitFor(() => {
      expect(steps).toContain('complete');
    });

    expect(steps).toEqual([
      'status:first',
      'run:first',
      'status:second',
      'run:second',
      'complete',
    ]);
  });
});

describe('pooled queue', () => {
  function createPooledQueue(concurrencyLimit = 2) {
    const signalComplete = { run: vi.fn() };
    const queue = new PooledQueue(
      'deferred',
      concurrencyLimit,
      { run: vi.fn() } as never,
      { run: vi.fn() } as never,
      signalComplete as never,
      createLoggerFactory(),
    );
    return { queue, signalComplete };
  }

  it('runs work up to the concurrency limit in parallel and signals completion', async () => {
    const steps: string[] = [];
    let releaseWorkers!: () => void;
    const workersGate = new Promise<void>((resolve) => {
      releaseWorkers = resolve;
    });
    const { queue, signalComplete } = createPooledQueue(2);

    queue.enqueue('a', async () => {
      steps.push('a:start');
      await workersGate;
      steps.push('a:end');
    });
    queue.enqueue('b', async () => {
      steps.push('b:start');
      await workersGate;
      steps.push('b:end');
    });
    queue.enqueue('c', async () => {
      steps.push('c');
    });

    await vi.waitFor(() => {
      expect(steps).toEqual(['a:start', 'b:start']);
    });
    expect(signalComplete.run).not.toHaveBeenCalled();

    releaseWorkers();
    await vi.waitFor(() => expect(signalComplete.run).toHaveBeenCalled());
    expect(steps).toEqual(['a:start', 'b:start', 'a:end', 'b:end', 'c']);
  });

  it('does not poll with setTimeout while waiting for in-flight workers', async () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    const steps: string[] = [];
    let releaseWorker!: () => void;
    const workerGate = new Promise<void>((resolve) => {
      releaseWorker = resolve;
    });
    const { queue, signalComplete } = createPooledQueue(2);

    queue.enqueue('blocked', async () => {
      steps.push('run');
      await workerGate;
    });

    await vi.waitFor(() => expect(steps).toContain('run'));
    const pollCallsBeforeRelease = setTimeoutSpy.mock.calls.filter(([, delay]) => delay === 100).length;

    releaseWorker();
    await vi.waitFor(() => expect(signalComplete.run).toHaveBeenCalledTimes(1));

    const pollCallsAfterRelease = setTimeoutSpy.mock.calls.filter(([, delay]) => delay === 100).length;
    expect(pollCallsAfterRelease).toBe(pollCallsBeforeRelease);
    setTimeoutSpy.mockRestore();
  });

  it('picks up work enqueued while workers are in flight', async () => {
    const steps: string[] = [];
    let releaseWorker!: () => void;
    const workerGate = new Promise<void>((resolve) => {
      releaseWorker = resolve;
    });
    const { queue, signalComplete } = createPooledQueue(1);

    queue.enqueue('first', async () => {
      steps.push('first:start');
      await workerGate;
      steps.push('first:end');
    });

    await vi.waitFor(() => expect(steps).toContain('first:start'));

    queue.enqueue('second', async () => {
      steps.push('second');
    });

    releaseWorker();
    await vi.waitFor(() => expect(signalComplete.run).toHaveBeenCalled());
    expect(steps).toEqual(['first:start', 'first:end', 'second']);
  });

  it('completes even after worker errors', async () => {
    const steps: string[] = [];
    const { queue, signalComplete } = createPooledQueue(2);

    queue.enqueue('ok', async () => {
      steps.push('ok');
    });
    queue.enqueue('fail', async () => {
      steps.push('fail');
      throw new Error('expected');
    });

    await vi.waitFor(() => expect(signalComplete.run).toHaveBeenCalled());
    expect(steps).toEqual(['ok', 'fail']);
  });
});

describe('keyed data_io queue', () => {
  function createKeyedQueue(readConcurrency = 4) {
    const signalComplete = { run: vi.fn() };
    const queue = new KeyedDataIoQueue(
      'data_io',
      readConcurrency,
      { run: vi.fn() } as never,
      { run: vi.fn() } as never,
      signalComplete as never,
      createLoggerFactory(),
    );
    return { queue, signalComplete };
  }

  it('runs keyless work serially one item at a time', async () => {
    const steps: string[] = [];
    const { queue, signalComplete } = createKeyedQueue();

    queue.enqueue('first', async () => {
      steps.push('run:first');
    });
    queue.enqueue('second', async () => {
      steps.push('run:second');
    });

    await vi.waitFor(() => expect(signalComplete.run).toHaveBeenCalled());
    expect(steps).toEqual(['run:first', 'run:second']);
  });

  it('runs keyed reads on different files in parallel', async () => {
    const steps: string[] = [];
    let releaseReads!: () => void;
    const readsGate = new Promise<void>((resolve) => {
      releaseReads = resolve;
    });
    const { queue, signalComplete } = createKeyedQueue(4);

    queue.enqueue(
      'read-a',
      async () => {
        steps.push('read-a:start');
        await readsGate;
        steps.push('read-a:end');
      },
      { key: 'data/a.json', access: 'read' },
    );
    queue.enqueue(
      'read-b',
      async () => {
        steps.push('read-b:start');
        await readsGate;
        steps.push('read-b:end');
      },
      { key: 'data/b.json', access: 'read' },
    );

    await vi.waitFor(() => {
      expect(steps).toEqual(['read-a:start', 'read-b:start']);
    });

    releaseReads();
    await vi.waitFor(() => expect(signalComplete.run).toHaveBeenCalled());
    expect(steps).toEqual(['read-a:start', 'read-b:start', 'read-a:end', 'read-b:end']);
  });

  it('orders a write after pending reads on the same key', async () => {
    const steps: string[] = [];
    let releaseRead!: () => void;
    const readGate = new Promise<void>((resolve) => {
      releaseRead = resolve;
    });
    const { queue, signalComplete } = createKeyedQueue(4);
    const key = 'data/themes/foo-1.0.0.theme.json';

    queue.enqueue(
      'read',
      async () => {
        steps.push('read:start');
        await readGate;
        steps.push('read:end');
      },
      { key, access: 'read' },
    );
    queue.enqueue(
      'write',
      async () => {
        steps.push('write');
      },
      { key, access: 'write' },
    );

    await vi.waitFor(() => expect(steps).toContain('read:start'));
    expect(steps).not.toContain('write');

    releaseRead();
    await vi.waitFor(() => expect(signalComplete.run).toHaveBeenCalled());
    expect(steps).toEqual(['read:start', 'read:end', 'write']);
  });

  it('serializes writes on the same key', async () => {
    const steps: string[] = [];
    let releaseFirstWrite!: () => void;
    const firstWriteGate = new Promise<void>((resolve) => {
      releaseFirstWrite = resolve;
    });
    const { queue, signalComplete } = createKeyedQueue(4);
    const key = 'data/catalogs/foo-1.0.0.json';

    queue.enqueue(
      'write-1',
      async () => {
        steps.push('write-1:start');
        await firstWriteGate;
        steps.push('write-1:end');
      },
      { key, access: 'write' },
    );
    queue.enqueue(
      'write-2',
      async () => {
        steps.push('write-2');
      },
      { key, access: 'write' },
    );

    await vi.waitFor(() => expect(steps).toContain('write-1:start'));
    expect(steps).not.toContain('write-2');

    releaseFirstWrite();
    await vi.waitFor(() => expect(signalComplete.run).toHaveBeenCalled());
    expect(steps).toEqual(['write-1:start', 'write-1:end', 'write-2']);
  });
});

describe('coalescing policy — pure functions', () => {
  it('coalesceLatest returns the incoming action unchanged', () => {
    const pending = { type: 'T', value: 1 } as unknown as AppAction;
    const incoming = { type: 'T', value: 2 } as unknown as AppAction;
    expect(coalesceLatest(pending, incoming)).toBe(incoming);
  });

  it('coalesceSumValue sums value fields and takes all other fields from incoming', () => {
    const pending = { type: 'T', value: 3, label: 'old' } as unknown as AppAction & { value: number };
    const incoming = { type: 'T', value: 5, label: 'new' } as unknown as AppAction & { value: number };
    const result = coalesceSumValue(pending, incoming);
    expect(result.value).toBe(8);
    expect((result as ActionWithLabel).label).toBe('new');
  });

  it('tryCoalesce returns null when no domain coalescer matches (e.g. mismatched types passed directly)', () => {
    expect(tryCoalesce(
      { type: 'TYPE_A' } as unknown as AppAction,
      { type: 'TYPE_B' } as unknown as AppAction,
    )).toBeNull();
  });

  it('tryCoalesce returns null for types absent from coalescer maps (e.g. commit actions)', () => {
    expect(tryCoalesce(
      { type: ThemePaletteCardActionType.AssignColorPickerOnCommit, value: '#ff0000' } as unknown as AppAction,
      { type: ThemePaletteCardActionType.AssignColorPickerOnCommit, value: '#00ff00' } as unknown as AppAction,
    )).toBeNull();
  });

  it('tryCoalesce returns the incoming action for a latest-only coalescer type', () => {
    const pending = { type: ThemePaletteCardActionType.AssignColorPickerOnSelect, value: '#ff0000' } as unknown as AppAction;
    const incoming = { type: ThemePaletteCardActionType.AssignColorPickerOnSelect, value: '#00ff00' } as unknown as AppAction;
    expect(tryCoalesce(pending, incoming)).toBe(incoming);
  });

  it('tryCoalesce coalesces hue slider delta actions', () => {
    const pending = { type: ThemePaletteCardActionType.HueSliderOnDelta, value: 30 } as unknown as AppAction;
    const incoming = { type: ThemePaletteCardActionType.HueSliderOnDelta, value: 35 } as unknown as AppAction;
    expect(tryCoalesce(pending, incoming)).toBe(incoming);
  });

  it('tryCoalesce does not coalesce hue slider commit actions', () => {
    const pending = { type: ThemePaletteCardActionType.HueSliderOnCommit, value: 30 } as unknown as AppAction;
    const incoming = { type: ThemePaletteCardActionType.HueSliderOnCommit, value: 35 } as unknown as AppAction;
    expect(tryCoalesce(pending, incoming)).toBeNull();
  });
});

describe('action queue coalescing — integration', () => {
  function buildQueue() {
    let resolveBlock: (() => void) | null = null;
    const processed: AppAction[] = [];
    const signalComplete = { run: vi.fn() };
    const actionProcessor = {
      process: vi.fn(async (action: AppAction) => {
        await new Promise<void>((resolve) => { resolveBlock = resolve; });
        processed.push(action);
      }),
    };
    const queue = new ActionQueue(
      actionProcessor as never,
      { run: vi.fn() } as never,
      signalComplete as never,
      createLoggerFactory(),
    );
    const unblock = () => { const r = resolveBlock; resolveBlock = null; r?.(); };
    return { queue, processed, signalComplete, unblock };
  }

  it('latest-only: replaces the pending action with the newest payload', async () => {
    const { queue, processed, signalComplete, unblock } = buildQueue();

    queue.enqueue({ type: ThemePaletteCardActionType.AssignColorPickerOnSelect, value: '#111111' } as unknown as AppAction);
    // While #111111 is in-flight, enqueue two more of the same type — only the latest survives in the pending slot
    queue.enqueue({ type: ThemePaletteCardActionType.AssignColorPickerOnSelect, value: '#222222' } as unknown as AppAction);
    queue.enqueue({ type: ThemePaletteCardActionType.AssignColorPickerOnSelect, value: '#333333' } as unknown as AppAction);

    unblock();
    await vi.waitFor(() => expect(processed).toHaveLength(1));

    unblock();
    await vi.waitFor(() => expect(signalComplete.run).toHaveBeenCalled());

    expect(processed).toHaveLength(2);
    expect((processed[0] as ActionWithValue<string>).value).toBe('#111111');
    expect((processed[1] as ActionWithValue<string>).value).toBe('#333333');
  });

  it('non-listed types are never coalesced: both actions are processed in order', async () => {
    const { queue, processed, signalComplete, unblock } = buildQueue();

    queue.enqueue({ type: 'NON_COALESCING_TYPE', value: 1 } as unknown as AppAction);
    queue.enqueue({ type: 'NON_COALESCING_TYPE', value: 2 } as unknown as AppAction);

    unblock();
    await vi.waitFor(() => expect(processed).toHaveLength(1));
    unblock();
    await vi.waitFor(() => expect(signalComplete.run).toHaveBeenCalled());

    expect(processed).toHaveLength(2);
    expect((processed[0] as ActionWithValue<number>).value).toBe(1);
    expect((processed[1] as ActionWithValue<number>).value).toBe(2);
  });

  it('ordering preserved: coalesces into the most-recent match; non-coalescing action keeps its queue position', async () => {
    const { queue, processed, signalComplete, unblock } = buildQueue();

    queue.enqueue({ type: ThemePaletteCardActionType.AssignColorPickerOnSelect, value: '#aaaaaa' } as unknown as AppAction);
    // Non-coalescing action in between
    queue.enqueue({ type: 'NON_COALESCING_COMMIT', committed: true } as unknown as AppAction);
    // Two more of the coalescing type — last one wins
    queue.enqueue({ type: ThemePaletteCardActionType.AssignColorPickerOnSelect, value: '#bbbbbb' } as unknown as AppAction);
    queue.enqueue({ type: ThemePaletteCardActionType.AssignColorPickerOnSelect, value: '#cccccc' } as unknown as AppAction);

    for (let i = 0; i < 3; i++) {
      unblock();
      await vi.waitFor(() => expect(processed).toHaveLength(i + 1));
    }
    await vi.waitFor(() => expect(signalComplete.run).toHaveBeenCalled());

    // Interactive coalesced actions drain before the normal-lane commit action.
    expect(processed).toHaveLength(3);
    expect((processed[0] as ActionWithValue<string>).value).toBe('#aaaaaa');
    expect((processed[1] as ActionWithValue<string>).value).toBe('#cccccc');
    expect((processed[2] as ActionWithCommit).committed).toBe(true);
  });
});
