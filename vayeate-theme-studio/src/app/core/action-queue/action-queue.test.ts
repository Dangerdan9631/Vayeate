import { describe, expect, it, vi } from 'vitest';
import * as scheduler from '../../../domain/core/scheduler';
import type { LoggerFactory } from '../../../domain/utils/logger';
import { ThemePaletteCardActionType } from '../../theme/theme-palette-card/actions/theme-palette-card-action-type';
import { ThemeVariablesCardActionType } from '../../theme/theme-variables-card/actions/theme-variables-card-action-type';
import { ActionQueue } from './action-queue';
import type { AppAction } from './app-action';

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

function buildQueue(processImpl?: (action: AppAction) => void | Promise<void>) {
  const processed: AppAction[] = [];
  let resolveBlock: (() => void) | null = null;
  const actionProcessor = {
    process: vi.fn(async (action: AppAction) => {
      if (processImpl) {
        await processImpl(action);
        return;
      }
      await new Promise<void>((resolve) => {
        resolveBlock = resolve;
      });
      processed.push(action);
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
  const unblock = () => {
    const release = resolveBlock;
    resolveBlock = null;
    release?.();
  };

  return {
    queue,
    processed,
    actionProcessor,
    updateActionQueueStatus,
    signalActionQueueProcessingComplete,
    unblock,
  };
}

describe('ActionQueue cooperative scheduling', () => {
  it('drains interactive actions before queued normal actions', async () => {
    const { queue, processed, signalActionQueueProcessingComplete, unblock } = buildQueue();

    queue.enqueue({ type: ThemeVariablesCardActionType.SearchTextOnChange, value: 'typed' } as unknown as AppAction);
    queue.enqueue({ type: 'HEAVY_NORMAL_ACTION' } as unknown as AppAction);

    unblock();
    await vi.waitFor(() => expect(processed).toHaveLength(1));
    unblock();
    await vi.waitFor(() => expect(processed).toHaveLength(2));
    await vi.waitFor(() => expect(signalActionQueueProcessingComplete.run).toHaveBeenCalled());

    expect(processed.map((action) => action.type)).toEqual([
      ThemeVariablesCardActionType.SearchTextOnChange,
      'HEAVY_NORMAL_ACTION',
    ]);
  });

  it('preempts pending normal work when an interactive action arrives mid-drain', async () => {
    const { queue, processed, signalActionQueueProcessingComplete, unblock } = buildQueue();

    queue.enqueue({ type: 'FIRST_NORMAL' } as unknown as AppAction);
    queue.enqueue({ type: 'SECOND_NORMAL' } as unknown as AppAction);
    queue.enqueue({ type: ThemeVariablesCardActionType.SearchTextOnChange, value: 'fast' } as unknown as AppAction);

    for (let i = 0; i < 3; i++) {
      unblock();
      await vi.waitFor(() => expect(processed).toHaveLength(i + 1));
    }
    await vi.waitFor(() => expect(signalActionQueueProcessingComplete.run).toHaveBeenCalled());

    expect(processed.map((action) => action.type)).toEqual([
      'FIRST_NORMAL',
      ThemeVariablesCardActionType.SearchTextOnChange,
      'SECOND_NORMAL',
    ]);
  });

  it('yields to the event loop after an action exceeds the frame budget', async () => {
    const yieldSpy = vi.spyOn(scheduler, 'yieldToEventLoop').mockResolvedValue();
    const processedTypes: string[] = [];
    const { queue, signalActionQueueProcessingComplete } = buildQueue(async (action) => {
      if ((action.type as string) === 'SLOW_NORMAL') {
        const startedAt = performance.now();
        while (performance.now() - startedAt < 10) {
          // Busy-wait to exceed the 8ms action budget.
        }
      }
      processedTypes.push(action.type);
    });

    queue.enqueue({ type: 'SLOW_NORMAL' } as unknown as AppAction);
    queue.enqueue({ type: 'NEXT_NORMAL' } as unknown as AppAction);

    await vi.waitFor(() => expect(processedTypes).toEqual(['SLOW_NORMAL', 'NEXT_NORMAL']));
    await vi.waitFor(() => expect(signalActionQueueProcessingComplete.run).toHaveBeenCalled());

    expect(yieldSpy).toHaveBeenCalledTimes(1);
    yieldSpy.mockRestore();
  });

  it('reports combined interactive and normal queue length to status updates', async () => {
    const { queue, processed, updateActionQueueStatus, signalActionQueueProcessingComplete, unblock } = buildQueue();

    queue.enqueue({ type: 'HOLD_NORMAL' } as unknown as AppAction);
    queue.enqueue({ type: ThemeVariablesCardActionType.SearchTextOnChange, value: 'a' } as unknown as AppAction);
    queue.enqueue({ type: 'NORMAL_TWO' } as unknown as AppAction);

    unblock();
    await vi.waitFor(() => expect(processed).toHaveLength(1));
    expect(updateActionQueueStatus.run).toHaveBeenCalledWith(2, expect.any(String));

    for (let i = 1; i < 3; i++) {
      unblock();
      await vi.waitFor(() => expect(processed).toHaveLength(i + 1));
    }
    await vi.waitFor(() => expect(signalActionQueueProcessingComplete.run).toHaveBeenCalled());
  });

  it('coalesces pending actions within the same lane only', async () => {
    const { queue, processed, signalActionQueueProcessingComplete, unblock } = buildQueue();

    queue.enqueue({ type: ThemePaletteCardActionType.AssignColorPickerOnSelect, value: '#111111' } as unknown as AppAction);
    queue.enqueue({ type: ThemePaletteCardActionType.AssignColorPickerOnSelect, value: '#222222' } as unknown as AppAction);
    queue.enqueue({ type: ThemePaletteCardActionType.AssignColorPickerOnSelect, value: '#333333' } as unknown as AppAction);

    unblock();
    await vi.waitFor(() => expect(processed).toHaveLength(1));
    expect((processed[0] as { value: string }).value).toBe('#111111');

    unblock();
    await vi.waitFor(() => expect(signalActionQueueProcessingComplete.run).toHaveBeenCalled());
    expect(processed).toHaveLength(2);
    expect((processed[1] as { value: string }).value).toBe('#333333');
  });

  it('does not yield after fast actions', async () => {
    const yieldSpy = vi.spyOn(scheduler, 'yieldToEventLoop').mockResolvedValue();
    const processed: string[] = [];
    const { queue, signalActionQueueProcessingComplete } = buildQueue(async (action) => {
      processed.push(action.type);
    });

    queue.enqueue({ type: 'FAST_ONE' } as unknown as AppAction);
    queue.enqueue({ type: 'FAST_TWO' } as unknown as AppAction);

    await vi.waitFor(() => expect(processed).toEqual(['FAST_ONE', 'FAST_TWO']));
    await vi.waitFor(() => expect(signalActionQueueProcessingComplete.run).toHaveBeenCalled());

    expect(yieldSpy).not.toHaveBeenCalled();
    yieldSpy.mockRestore();
  });
});
