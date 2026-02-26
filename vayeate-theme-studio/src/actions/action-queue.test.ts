import { ActionQueue, type ActionProcessor } from './action-queue';
import type { AppAction } from './action-types';
import type { AppStateUpdate } from '../state/app-state';

describe('ActionQueue', () => {
  it('processes actions in FIFO order and calls setState with correct updates', async () => {
    const received: { action: AppAction; updates: AppStateUpdate[] }[] = [];
    const processor: ActionProcessor = async (action, setState) => {
      const updates: AppStateUpdate[] = [];
      const captureSetState = (update: AppStateUpdate) => {
        updates.push(update);
        setState(update);
      };
      if (action.type === 'SET_ACTIVE_TAB') {
        captureSetState({ type: 'SET_ACTIVE_TAB', tabId: action.tabId });
      }
      received.push({ action, updates });
    };

    const queue = new ActionQueue(processor);
    queue.onStateUpdate = () => {};

    queue.enqueue({ type: 'SET_ACTIVE_TAB', tabId: 'templates' });
    queue.enqueue({ type: 'SET_ACTIVE_TAB', tabId: 'themes' });

    await new Promise((r) => setTimeout(r, 50));

    expect(received).toHaveLength(2);
    expect(received[0].action).toEqual({ type: 'SET_ACTIVE_TAB', tabId: 'templates' });
    expect(received[0].updates).toEqual([{ type: 'SET_ACTIVE_TAB', tabId: 'templates' }]);
    expect(received[1].action).toEqual({ type: 'SET_ACTIVE_TAB', tabId: 'themes' });
    expect(received[1].updates).toEqual([{ type: 'SET_ACTIVE_TAB', tabId: 'themes' }]);
  });

  it('processes next action only after previous processor completes', async () => {
    const order: string[] = [];
    const processor: ActionProcessor = async (action, setState) => {
      if (action.type === 'SET_ACTIVE_TAB') {
        order.push(`start-${action.tabId as string}`);
        await new Promise((r) => setTimeout(r, 20));
        order.push(`end-${action.tabId as string}`);
        setState({ type: 'SET_ACTIVE_TAB', tabId: action.tabId });
      }
    };

    const queue = new ActionQueue(processor);
    queue.onStateUpdate = () => {};

    queue.enqueue({ type: 'SET_ACTIVE_TAB', tabId: 'catalogs' });
    queue.enqueue({ type: 'SET_ACTIVE_TAB', tabId: 'templates' });

    await new Promise((r) => setTimeout(r, 60));

    expect(order).toEqual(['start-catalogs', 'end-catalogs', 'start-templates', 'end-templates']);
  });

  it('calls onStateUpdate when processor calls setState', async () => {
    const updates: AppStateUpdate[] = [];
    const processor: ActionProcessor = async (action, setState) => {
      if (action.type === 'SET_ACTIVE_TAB') {
        setState({ type: 'SET_ACTIVE_TAB', tabId: action.tabId });
      }
    };

    const queue = new ActionQueue(processor);
    queue.onStateUpdate = (u) => updates.push(u);

    queue.enqueue({ type: 'SET_ACTIVE_TAB', tabId: 'catalogs' });

    await new Promise((r) => setTimeout(r, 20));

    expect(updates).toEqual([{ type: 'SET_ACTIVE_TAB', tabId: 'catalogs' }]);
  });
});
