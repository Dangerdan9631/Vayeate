import { beforeAll, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { container } from 'tsyringe';
import { AppConfigStore } from '../../../domain/state/data/app-config-store';
import { UndoStackStore } from '../../../domain/state/undo-stack/undo-stack-store';
import { UiStore } from '../../../domain/state/ui/ui-store';
import { WindowStore } from '../../../domain/state/ui/window-store';
import { emptyUndoMenuSnapshot } from '../../../domain/state/undo-stack/undo-stack-state';

vi.mock('../../core/action-queue/use-app-dispatch', () => ({
  useAppDispatch: () => vi.fn(),
}));

const uiStore = new UiStore();
const appConfigStore = new AppConfigStore();
const undoStackStore = new UndoStackStore();
const windowStore = new WindowStore();
const originalResolve = container.resolve.bind(container);

describe('useMenuBarViewModel', () => {
  let useMenuBarViewModel: typeof import('./use-menubar-viewmodel').useMenuBarViewModel;

  beforeAll(async () => {
    vi.spyOn(container, 'resolve').mockImplementation((token: unknown) => {
      if (token === UiStore) return uiStore;
      if (token === AppConfigStore) return appConfigStore;
      if (token === UndoStackStore) return undoStackStore;
      if (token === WindowStore) return windowStore;
      return originalResolve(token as never);
    });
    ({ useMenuBarViewModel } = await import('./use-menubar-viewmodel'));
  });

  it('keeps undo menu slice references when only window maximize state changes', async () => {
    undoStackStore.getStore().setUndoMenuSnapshot({
      ...emptyUndoMenuSnapshot,
      canUndo: true,
      nextUndoDescription: 'Edit token',
    });

    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount += 1;
      return useMenuBarViewModel();
    });

    await waitFor(() => {
      expect(result.current.canUndo).toBe(true);
    });

    const canUndoBefore = result.current.canUndo;
    const nextUndoDescriptionBefore = result.current.nextUndoDescription;
    const framesBefore = result.current.frames;
    const renderCountBefore = renderCount;

    windowStore.getStore().setWindowMaximized(true);

    await waitFor(() => {
      expect(result.current.isMaximized).toBe(true);
    });

    expect(renderCount).toBeGreaterThan(renderCountBefore);
    expect(result.current.canUndo).toBe(canUndoBefore);
    expect(result.current.nextUndoDescription).toBe(nextUndoDescriptionBefore);
    expect(result.current.frames).toBe(framesBefore);
  });
});
