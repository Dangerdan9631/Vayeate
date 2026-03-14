import { ActionQueueV2, type ActionProcessorV2 } from './action-queue-v2';
import type { AppActionV2 } from './action-types';
import type { AppStateUpdate } from '../state/app-state';
import type { QueueStatus } from './action-queue';

describe('ActionQueueV2', () => {
  it('processes actions in FIFO order and calls setState with correct updates', async () => {
    const received: { action: AppActionV2; updates: AppStateUpdate[] }[] = [];
    const processor: ActionProcessorV2 = async (action, setState) => {
      const updates: AppStateUpdate[] = [];
      const captureSetState = (update: AppStateUpdate) => {
        updates.push(update);
        setState(update);
      };
      if (action.type === 'APP_RIBBON_TAB_BUTTON_ON_CLICK') {
        captureSetState({ type: 'SET_ACTIVE_TAB', tabId: action.tabId });
      }
      received.push({ action, updates });
    };

    const queue = new ActionQueueV2(processor);
    queue.onStateUpdate = () => {};

    queue.enqueue({ type: 'APP_RIBBON_TAB_BUTTON_ON_CLICK', tabId: 'templates' });
    queue.enqueue({ type: 'APP_RIBBON_TAB_BUTTON_ON_CLICK', tabId: 'themes' });

    await new Promise((r) => setTimeout(r, 50));

    expect(received).toHaveLength(2);
    expect(received[0].action).toEqual({ type: 'APP_RIBBON_TAB_BUTTON_ON_CLICK', tabId: 'templates' });
    expect(received[0].updates).toEqual([{ type: 'SET_ACTIVE_TAB', tabId: 'templates' }]);
    expect(received[1].action).toEqual({ type: 'APP_RIBBON_TAB_BUTTON_ON_CLICK', tabId: 'themes' });
    expect(received[1].updates).toEqual([{ type: 'SET_ACTIVE_TAB', tabId: 'themes' }]);
  });

  it('processes next action only after previous processor completes', async () => {
    const order: string[] = [];
    const processor: ActionProcessorV2 = async (action, setState) => {
      if (action.type === 'APP_RIBBON_TAB_BUTTON_ON_CLICK') {
        order.push(`start-${action.tabId as string}`);
        await new Promise((r) => setTimeout(r, 20));
        order.push(`end-${action.tabId as string}`);
        setState({ type: 'SET_ACTIVE_TAB', tabId: action.tabId });
      }
    };

    const queue = new ActionQueueV2(processor);
    queue.onStateUpdate = () => {};

    queue.enqueue({ type: 'APP_RIBBON_TAB_BUTTON_ON_CLICK', tabId: 'catalogs' });
    queue.enqueue({ type: 'APP_RIBBON_TAB_BUTTON_ON_CLICK', tabId: 'templates' });

    await new Promise((r) => setTimeout(r, 60));

    expect(order).toEqual(['start-catalogs', 'end-catalogs', 'start-templates', 'end-templates']);
  });

  it('calls onQueueStatus with processing state and queue length', async () => {
    const statuses: QueueStatus[] = [];
    const processor: ActionProcessorV2 = async (action, setState) => {
      await new Promise((r) => setTimeout(r, 10));
      if (action.type === 'APP_RIBBON_TAB_BUTTON_ON_CLICK') {
        setState({ type: 'SET_ACTIVE_TAB', tabId: action.tabId });
      }
    };

    const queue = new ActionQueueV2(processor);
    queue.onStateUpdate = () => {};
    queue.onQueueStatus = (s) => statuses.push({ ...s });

    queue.enqueue({ type: 'APP_RIBBON_TAB_BUTTON_ON_CLICK', tabId: 'catalogs' });
    queue.enqueue({ type: 'APP_RIBBON_TAB_BUTTON_ON_CLICK', tabId: 'templates' });

    await new Promise((r) => setTimeout(r, 80));

    expect(statuses.length).toBeGreaterThan(0);
    expect(statuses[statuses.length - 1]).toEqual({ isProcessing: false, queueLength: 0 });
    const hadProcessing = statuses.some((s) => s.isProcessing);
    expect(hadProcessing).toBe(true);
  });

  it('calls onStateUpdate when processor calls setState', async () => {
    const updates: AppStateUpdate[] = [];
    const processor: ActionProcessorV2 = async (action, setState) => {
      if (action.type === 'APP_APP_ON_LOAD') {
        setState({ type: 'SET_ACTIVE_TAB', tabId: 'catalogs' });
      }
    };

    const queue = new ActionQueueV2(processor);
    queue.onStateUpdate = (u) => updates.push(u);

    queue.enqueue({ type: 'APP_APP_ON_LOAD' });

    await new Promise((r) => setTimeout(r, 20));

    expect(updates).toEqual([{ type: 'SET_ACTIVE_TAB', tabId: 'catalogs' }]);
  });
});
