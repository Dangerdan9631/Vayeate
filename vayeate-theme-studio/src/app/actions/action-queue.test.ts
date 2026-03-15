import { ActionQueue, type ActionProcessor } from './action-queue';
import type { AppActionV2 } from './action-types';
import type { AppStateUpdate } from '../../domain/state/app-state';
import type { QueueStatus } from './action-queue';
import type { UiStateUpdate } from '../../domain/state/ui-state-reducer';

describe('ActionQueue', () => {
  it('processes actions in FIFO order and calls setUiState with correct updates for tab clicks', async () => {
    const received: { action: AppActionV2; uiUpdates: UiStateUpdate[] }[] = [];
    const processor: ActionProcessor = async (action) => {
      const uiUpdates: UiStateUpdate[] = [];
      const setUiState = (update: UiStateUpdate) => uiUpdates.push(update);
      if (action.type === 'APP_RIBBON_TAB_BUTTON_ON_CLICK') {
        setUiState({ type: 'SET_UI_ACTIVE_TAB_ID', tabId: action.tabId });
      }
      received.push({ action, uiUpdates });
    };

    const queue = new ActionQueue(processor);

    queue.enqueue({ type: 'APP_RIBBON_TAB_BUTTON_ON_CLICK', tabId: 'templates' });
    queue.enqueue({ type: 'APP_RIBBON_TAB_BUTTON_ON_CLICK', tabId: 'themes' });

    await new Promise((r) => setTimeout(r, 50));

    expect(received).toHaveLength(2);
    expect(received[0].action).toEqual({ type: 'APP_RIBBON_TAB_BUTTON_ON_CLICK', tabId: 'templates' });
    expect(received[0].uiUpdates).toEqual([{ type: 'SET_UI_ACTIVE_TAB_ID', tabId: 'templates' }]);
    expect(received[1].action).toEqual({ type: 'APP_RIBBON_TAB_BUTTON_ON_CLICK', tabId: 'themes' });
    expect(received[1].uiUpdates).toEqual([{ type: 'SET_UI_ACTIVE_TAB_ID', tabId: 'themes' }]);
  });

  it('processes next action only after previous processor completes', async () => {
    const order: string[] = [];
    const processor: ActionProcessor = async (action) => {
      if (action.type === 'APP_RIBBON_TAB_BUTTON_ON_CLICK') {
        order.push(`start-${action.tabId as string}`);
        await new Promise((r) => setTimeout(r, 20));
        order.push(`end-${action.tabId as string}`);
      }
    };

    const queue = new ActionQueue(processor);

    queue.enqueue({ type: 'APP_RIBBON_TAB_BUTTON_ON_CLICK', tabId: 'catalogs' });
    queue.enqueue({ type: 'APP_RIBBON_TAB_BUTTON_ON_CLICK', tabId: 'templates' });

    await new Promise((r) => setTimeout(r, 60));

    expect(order).toEqual(['start-catalogs', 'end-catalogs', 'start-templates', 'end-templates']);
  });

  it('calls onQueueStatus with processing state and queue length', async () => {
    const statuses: QueueStatus[] = [];
    const processor: ActionProcessor = async (_action) => {
      await new Promise((r) => setTimeout(r, 10));
    };

    const queue = new ActionQueue(processor);
    queue.onQueueStatus = (s) => statuses.push({ ...s });

    queue.enqueue({ type: 'APP_RIBBON_TAB_BUTTON_ON_CLICK', tabId: 'catalogs' });
    queue.enqueue({ type: 'APP_RIBBON_TAB_BUTTON_ON_CLICK', tabId: 'templates' });

    await new Promise((r) => setTimeout(r, 80));

    expect(statuses.length).toBeGreaterThan(0);
    expect(statuses[statuses.length - 1]).toEqual({ isProcessing: false, queueLength: 0 });
    const hadProcessing = statuses.some((s) => s.isProcessing);
    expect(hadProcessing).toBe(true);
  });

  it('processor uses setState from closure to apply updates', async () => {
    const updates: AppStateUpdate[] = [];
    const setState = (u: AppStateUpdate) => updates.push(u);
    const processor: ActionProcessor = async (action) => {
      if (action.type === 'APP_APP_ON_LOAD') {
        setState({ type: 'SET_CATALOG_REFS', refs: [] });
      }
    };

    const queue = new ActionQueue(processor);

    queue.enqueue({ type: 'APP_APP_ON_LOAD' });

    await new Promise((r) => setTimeout(r, 20));

    expect(updates).toEqual([{ type: 'SET_CATALOG_REFS', refs: [] }]);
  });
});
