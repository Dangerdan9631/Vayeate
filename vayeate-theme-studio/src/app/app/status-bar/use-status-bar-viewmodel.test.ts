import { beforeAll, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { container } from 'tsyringe';
import { ActionQueueUiStore } from '../../../domain/state/ui/action-queue-ui-store';
import { BackgroundQueueUiStore } from '../../../domain/state/ui/background-queue-ui-store';

const actionQueueStore = new ActionQueueUiStore();
const backgroundQueueStore = new BackgroundQueueUiStore();
const originalResolve = container.resolve.bind(container);

describe('useStatusBarViewModel', () => {
  let useStatusBarViewModel: typeof import('./use-status-bar-viewmodel').useStatusBarViewModel;

  beforeAll(async () => {
    vi.spyOn(container, 'resolve').mockImplementation((token: unknown) => {
      if (token === ActionQueueUiStore) return actionQueueStore;
      if (token === BackgroundQueueUiStore) return backgroundQueueStore;
      return originalResolve(token as never);
    });
    ({ useStatusBarViewModel } = await import('./use-status-bar-viewmodel'));
  });

  it('does not rerender when action queue status is rewritten with the same idle values', async () => {
    actionQueueStore.getStore().completeQueueProcessing();
    backgroundQueueStore.getStore().completeQueueProcessing('main');

    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useStatusBarViewModel();
    });

    expect(result.current.showProgressArea).toBe(false);
    const renderCountBefore = renderCount;

    actionQueueStore.getStore().setQueueStatus(0, '');

    expect(renderCount).toBe(renderCountBefore);
    expect(result.current.showProgressArea).toBe(false);
  });

  it('rerenders when a background queue reports new work', async () => {
    actionQueueStore.getStore().completeQueueProcessing();
    backgroundQueueStore.getStore().completeQueueProcessing('main');

    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useStatusBarViewModel();
    });

    const renderCountBefore = renderCount;
    backgroundQueueStore.getStore().updateQueueStatus('data_io', ['Persist undo stack'], 1);

    await waitFor(() => {
      expect(result.current.showProgressArea).toBe(true);
    });

    expect(renderCount).toBeGreaterThan(renderCountBefore);
  });
});
