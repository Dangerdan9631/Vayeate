import { describe, it, expect, vi, beforeEach } from 'vitest';
import { container } from 'tsyringe';
import { LogService } from '../../gateway/services/log-service';
import { LoggerFactory } from '../../domain/utils/logger';
import { ActionQueue } from './action-queue';
import type { AppActionV2 } from './action-types';
import type { AppStateUpdate } from '../../domain/state/app-state';
import type { QueueStatus } from './action-queue';
import type { UiStateUpdate } from '../../domain/state/ui-state-reducer';
import { AppActionType } from './action-types';
import { handlerDepsSourceToken } from '../di/handler-deps-source';
import type { HandlerDeps } from '../handlers/handler-types';
import { ActionProcessor } from '../handlers/handler-registry';

function noopDeps(): HandlerDeps {
  return {
    setState: () => {},
    getState: () => {
      throw new Error('not used');
    },
    setUiState: () => {},
    setStoreState: () => {},
  };
}

describe('ActionQueue', () => {
  beforeEach(() => {
    container.clearInstances();
    container.registerInstance(LogService, { log: vi.fn() } as unknown as LogService);
    container.registerInstance(LoggerFactory, new LoggerFactory(container.resolve(LogService)));
  });

  it('processes actions in FIFO order and calls setUiState with correct updates for tab clicks', async () => {
    const received: { action: AppActionV2; uiUpdates: UiStateUpdate[] }[] = [];
    const process = async (action: AppActionV2, _deps: HandlerDeps) => {
      const uiUpdates: UiStateUpdate[] = [];
      const setUiState = (update: UiStateUpdate) => uiUpdates.push(update);
      if (action.type === AppActionType.AppRibbonTabButtonOnClick) {
        setUiState({ type: 'SET_UI_ACTIVE_TAB_ID', tabId: action.tabId });
      }
      received.push({ action, uiUpdates });
    };
    container.registerInstance(
      ActionProcessor,
      { process } as unknown as ActionProcessor,
    );
    container.registerInstance(handlerDepsSourceToken, {
      get: noopDeps,
    });

    const queue = container.resolve(ActionQueue);

    queue.enqueue({ type: AppActionType.AppRibbonTabButtonOnClick, tabId: 'templates' });
    queue.enqueue({ type: AppActionType.AppRibbonTabButtonOnClick, tabId: 'themes' });

    await new Promise((r) => setTimeout(r, 50));

    expect(received).toHaveLength(2);
    expect(received[0].action).toEqual({ type: AppActionType.AppRibbonTabButtonOnClick, tabId: 'templates' });
    expect(received[0].uiUpdates).toEqual([{ type: 'SET_UI_ACTIVE_TAB_ID', tabId: 'templates' }]);
    expect(received[1].action).toEqual({ type: AppActionType.AppRibbonTabButtonOnClick, tabId: 'themes' });
    expect(received[1].uiUpdates).toEqual([{ type: 'SET_UI_ACTIVE_TAB_ID', tabId: 'themes' }]);
  });

  it('processes next action only after previous processor completes', async () => {
    const order: string[] = [];
    const process = async (action: AppActionV2, _deps: HandlerDeps) => {
      if (action.type === AppActionType.AppRibbonTabButtonOnClick) {
        order.push(`start-${action.tabId as string}`);
        await new Promise((r) => setTimeout(r, 20));
        order.push(`end-${action.tabId as string}`);
      }
    };
    container.registerInstance(
      ActionProcessor,
      { process } as unknown as ActionProcessor,
    );
    container.registerInstance(handlerDepsSourceToken, {
      get: noopDeps,
    });

    const queue = container.resolve(ActionQueue);

    queue.enqueue({ type: AppActionType.AppRibbonTabButtonOnClick, tabId: 'catalogs' });
    queue.enqueue({ type: AppActionType.AppRibbonTabButtonOnClick, tabId: 'templates' });

    await new Promise((r) => setTimeout(r, 60));

    expect(order).toEqual(['start-catalogs', 'end-catalogs', 'start-templates', 'end-templates']);
  });

  it('calls onQueueStatus with processing state and queue length', async () => {
    const statuses: QueueStatus[] = [];
    const process = async (_action: AppActionV2, _deps: HandlerDeps) => {
      await new Promise((r) => setTimeout(r, 10));
    };
    container.registerInstance(
      ActionProcessor,
      { process } as unknown as ActionProcessor,
    );
    container.registerInstance(handlerDepsSourceToken, {
      get: noopDeps,
    });

    const queue = container.resolve(ActionQueue);
    queue.onQueueStatus = (s) => statuses.push({ ...s });

    queue.enqueue({ type: AppActionType.AppRibbonTabButtonOnClick, tabId: 'catalogs' });
    queue.enqueue({ type: AppActionType.AppRibbonTabButtonOnClick, tabId: 'templates' });

    await new Promise((r) => setTimeout(r, 80));

    expect(statuses.length).toBeGreaterThan(0);
    expect(statuses[statuses.length - 1]).toEqual({ isProcessing: false, queueLength: 0 });
    const hadProcessing = statuses.some((s) => s.isProcessing);
    expect(hadProcessing).toBe(true);
  });

  it('processor uses setState from closure to apply updates', async () => {
    const updates: AppStateUpdate[] = [];
    const setState = (u: AppStateUpdate) => updates.push(u);
    const process = async (action: AppActionV2, deps: HandlerDeps) => {
      if (action.type === AppActionType.AppRibbonTabButtonOnClick) {
        deps.setState({ type: 'SET_CATALOG', catalog: null });
      }
    };
    container.registerInstance(
      ActionProcessor,
      { process } as unknown as ActionProcessor,
    );
    container.registerInstance(handlerDepsSourceToken, {
      get: () => ({ ...noopDeps(), setState }),
    });

    const queue = container.resolve(ActionQueue);

    queue.enqueue({ type: AppActionType.AppRibbonTabButtonOnClick, tabId: 'catalogs' });

    await new Promise((r) => setTimeout(r, 20));

    expect(updates).toEqual([{ type: 'SET_CATALOG', catalog: null }]);
  });
});
