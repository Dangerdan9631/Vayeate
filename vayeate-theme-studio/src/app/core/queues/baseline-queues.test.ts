import { describe, expect, it, vi } from 'vitest';
import { ActionQueue } from '../action-queue/action-queue';
import { BackgroundQueue } from '../background-queue/background-queue';
import { SerialQueue } from '../background-queue/serial-queue';
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
