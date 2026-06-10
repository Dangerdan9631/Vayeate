import { describe, expect, it, vi } from 'vitest';
import { ActionQueue } from '../action-queue/action-queue';
import { BackgroundQueue } from '../background-queue/background-queue';
import { SerialQueue } from '../background-queue/serial-queue';
import { tryCoalesce, mergeLatest, mergeSumDelta } from '../action-queue/action-coalescing-policy';
import type { LoggerFactory } from '../../../domain/utils/logger';
import type { AppAction } from '../action-queue/app-action';

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
    const workerQueue = { enqueue: vi.fn() };
    const dataIoQueue = { enqueue: vi.fn() };

    const queue = new BackgroundQueue(
      mainQueue as never,
      workerQueue as never,
      dataIoQueue as never,
      createLoggerFactory(),
    );

    queue.enqueue('worker', 'tokenize', () => {});
    queue.enqueue('data_io', 'persist', () => {});
    queue.enqueue('main', 'hydrate', () => {});

    expect(workerQueue.enqueue).toHaveBeenCalledWith('tokenize', expect.any(Function));
    expect(dataIoQueue.enqueue).toHaveBeenCalledWith('persist', expect.any(Function));
    expect(mainQueue.enqueue).toHaveBeenCalledWith('hydrate', expect.any(Function));
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

describe('coalescing policy — pure functions', () => {
  it('mergeLatest returns the incoming action unchanged', () => {
    const pending = { type: 'T', value: 1 } as unknown as AppAction;
    const incoming = { type: 'T', value: 2 } as unknown as AppAction;
    expect(mergeLatest(pending, incoming)).toBe(incoming);
  });

  it('mergeSumDelta sums value fields and takes all other fields from incoming', () => {
    const pending = { type: 'T', value: 3, label: 'old' } as unknown as AppAction & { value: number };
    const incoming = { type: 'T', value: 5, label: 'new' } as unknown as AppAction & { value: number };
    const result = mergeSumDelta(pending, incoming);
    expect(result.value).toBe(8);
    expect((result as any).label).toBe('new');
  });

  it('tryCoalesce returns null when action types differ', () => {
    expect(tryCoalesce(
      { type: 'TYPE_A' } as unknown as AppAction,
      { type: 'TYPE_B' } as unknown as AppAction,
    )).toBeNull();
  });

  it('tryCoalesce returns null for types absent from the policy (e.g. commit actions)', () => {
    expect(tryCoalesce(
      { type: 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_COMMIT' } as unknown as AppAction,
      { type: 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_COMMIT' } as unknown as AppAction,
    )).toBeNull();
  });

  it('tryCoalesce returns the incoming action for a latest-only policy type', () => {
    const pending = { type: 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_SELECT', value: '#ff0000' } as unknown as AppAction;
    const incoming = { type: 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_SELECT', value: '#00ff00' } as unknown as AppAction;
    expect(tryCoalesce(pending, incoming)).toBe(incoming);
  });

  it('tryCoalesce returns null for same type with no policy entry (slider delta — absolute value)', () => {
    // THEME_PALETTE_HUE_SLIDER_ON_DELTA IS in the latest-only policy, so it should coalesce
    const pending = { type: 'THEME_PALETTE_HUE_SLIDER_ON_DELTA', value: 30 } as unknown as AppAction;
    const incoming = { type: 'THEME_PALETTE_HUE_SLIDER_ON_DELTA', value: 35 } as unknown as AppAction;
    expect(tryCoalesce(pending, incoming)).toBe(incoming);
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

    queue.enqueue({ type: 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_SELECT', value: '#111111' } as unknown as AppAction);
    // While #111111 is in-flight, enqueue two more of the same type — only the latest survives in the pending slot
    queue.enqueue({ type: 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_SELECT', value: '#222222' } as unknown as AppAction);
    queue.enqueue({ type: 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_SELECT', value: '#333333' } as unknown as AppAction);

    unblock();
    await vi.waitFor(() => expect(processed).toHaveLength(1));

    unblock();
    await vi.waitFor(() => expect(signalComplete.run).toHaveBeenCalled());

    expect(processed).toHaveLength(2);
    expect((processed[0] as any).value).toBe('#111111');
    expect((processed[1] as any).value).toBe('#333333');
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
    expect((processed[0] as any).value).toBe(1);
    expect((processed[1] as any).value).toBe(2);
  });

  it('ordering preserved: coalesces into the most-recent match; non-coalescing action keeps its queue position', async () => {
    const { queue, processed, signalComplete, unblock } = buildQueue();

    queue.enqueue({ type: 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_SELECT', value: '#aaaaaa' } as unknown as AppAction);
    // Non-coalescing action in between
    queue.enqueue({ type: 'NON_COALESCING_COMMIT', committed: true } as unknown as AppAction);
    // Two more of the coalescing type — last one wins
    queue.enqueue({ type: 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_SELECT', value: '#bbbbbb' } as unknown as AppAction);
    queue.enqueue({ type: 'THEME_PALETTE_ASSIGN_COLOR_PICKER_ON_SELECT', value: '#cccccc' } as unknown as AppAction);

    for (let i = 0; i < 3; i++) {
      unblock();
      await vi.waitFor(() => expect(processed).toHaveLength(i + 1));
    }
    await vi.waitFor(() => expect(signalComplete.run).toHaveBeenCalled());

    // #aaaaaa was already shifted when later enqueues ran, so it processes as-is.
    // #bbbbbb and #cccccc were both pending; #cccccc coalesced into #bbbbbb's slot.
    // NON_COALESCING_COMMIT stays between them.
    expect(processed).toHaveLength(3);
    expect((processed[0] as any).value).toBe('#aaaaaa');
    expect((processed[1] as any).committed).toBe(true);
    expect((processed[2] as any).value).toBe('#cccccc');
  });
});
