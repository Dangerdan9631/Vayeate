import { describe, expect, it, vi } from 'vitest';
import type { BackgroundQueueKey } from '../../../model/background-queue';
import { createUndoManagerV2, undoManagerV2 } from '../../core/undo-manager-v2';
import type { UndoFrame, UndoPersistenceAdapter, UndoProcessor } from '../../core/undo-stack-types';
import { UndoStackStore } from '../../state/undo-stack/undo-stack-store';
import { deriveUndoContext } from '../../../model/undo-history';
import { SetCurrentUndoStackIdOperation } from './set-current-undo-stack-id-operation';

function processor(): UndoProcessor {
  return {
    applyProcessor: vi.fn(),
    revertProcessor: vi.fn(),
  };
}

function frame(id: string, contextKey: string): UndoFrame {
  return {
    id,
    contextKey,
    description: `Set ${id}`,
    diffs: [{ actionType: 'set-value', target: 'value', before: 'a', after: id }],
    createdAtSessionOrder: 1,
    persistenceStatus: 'pending',
  };
}

function persistence(): UndoPersistenceAdapter & { saved: Map<string, string> } {
  const saved = new Map<string, string>();
  return {
    saved,
    saveStack: vi.fn(async (stackId: string, payload: string) => {
      saved.set(stackId, payload);
    }),
    loadStack: vi.fn(async (stackId: string) => saved.get(stackId) ?? null),
    clearPersisted: vi.fn(async () => {
      saved.clear();
    }),
  };
}

function createOperation(
  undoStackStore: UndoStackStore,
  pendingHydrations: Array<() => void | Promise<void>>,
) {
  return new SetCurrentUndoStackIdOperation(
    undoStackStore,
    { execute: vi.fn(() => processor()) } as never,
    {
      execute: (_queue: BackgroundQueueKey, _description: string, run: () => void | Promise<void>) => {
        pendingHydrations.push(run);
      },
    } as never,
  );
}

describe('set current undo stack id operation', () => {
  it('reloads the last known context for a tab when switching back with an in-memory stack', async () => {
    await undoManagerV2.clearPersisted();
    const undoStackStore = new UndoStackStore();
    const pendingHydrations: Array<() => void | Promise<void>> = [];
    const operation = createOperation(undoStackStore, pendingHydrations);
    const originalThemeContext = deriveUndoContext({
      tabId: 'themes',
      templateRef: { name: 'template-a', version: '1.0.0' },
      catalogRef: { name: 'catalog-a', version: '1.0.0' },
      themeRef: { name: 'theme-a', version: '1.0.0' },
    });
    const fallbackThemeContext = deriveUndoContext({
      tabId: 'themes',
      templateRef: { name: 'template-b', version: '1.0.0' },
      catalogRef: { name: 'catalog-a', version: '1.0.0' },
      themeRef: { name: 'theme-a', version: '1.0.0' },
    });

    operation.executeForContext(originalThemeContext);
    await undoManagerV2.getOrCreate(originalThemeContext.contextKey, { processor: processor() });
    operation.executeAndLoadForTab('themes', fallbackThemeContext);

    expect(undoStackStore.getStore().state.currentUndoStackId).toBe(originalThemeContext.contextKey);
    expect(undoStackStore.getStore().state.undoMenu.activeContextKey).toBe(originalThemeContext.contextKey);
    expect(pendingHydrations).toHaveLength(0);
  });

  it('refreshes undo summary synchronously on an in-memory cache hit', async () => {
    await undoManagerV2.clearPersisted();
    const undoStackStore = new UndoStackStore();
    const pendingHydrations: Array<() => void | Promise<void>> = [];
    const operation = createOperation(undoStackStore, pendingHydrations);
    const context = deriveUndoContext({
      tabId: 'themes',
      templateRef: { name: 'template-a', version: '1.0.0' },
      catalogRef: { name: 'catalog-a', version: '1.0.0' },
      themeRef: { name: 'theme-a', version: '1.0.0' },
    });
    const stack = await undoManagerV2.getOrCreate(context.contextKey, { processor: processor() });
    await stack.push(frame('f1', context.contextKey));

    operation.executeAndLoadForContext(context);

    expect(undoStackStore.getStore().state.undoMenu.canUndo).toBe(true);
    expect(undoStackStore.getStore().state.undoMenu.activeContextKey).toBe(context.contextKey);
    expect(pendingHydrations).toHaveLength(0);
  });

  it('shows unavailable undo state immediately and hydrates from disk asynchronously on cache miss', async () => {
    const adapter = persistence();
    const manager = createUndoManagerV2({ persistence: adapter });
    const getIfLoadedSpy = vi.spyOn(undoManagerV2, 'getIfLoaded').mockImplementation(manager.getIfLoaded);
    const hydrateSpy = vi.spyOn(undoManagerV2, 'hydrateFromPersistence').mockImplementation(manager.hydrateFromPersistence);
    const undoStackStore = new UndoStackStore();
    const pendingHydrations: Array<() => void | Promise<void>> = [];
    const operation = createOperation(undoStackStore, pendingHydrations);
    const context = deriveUndoContext({
      tabId: 'catalogs',
      catalogRef: { name: 'catalog-a', version: '1.0.0' },
      templateRef: { name: 'template-a', version: '1.0.0' },
      themeRef: null,
    });

    const stack = await manager.getOrCreate(context.contextKey, { processor: processor() });
    await stack.push(frame('c1', context.contextKey));
    await manager.flushPendingPersists();
    await manager.release(context.contextKey);
    vi.mocked(adapter.loadStack).mockClear();

    operation.executeAndLoadForContext(context);

    expect(undoStackStore.getStore().state.currentUndoStackId).toBe(context.contextKey);
    expect(undoStackStore.getStore().state.undoMenu.canUndo).toBe(false);
    expect(undoStackStore.getStore().state.undoMenu.activeContextKey).toBeNull();
    expect(pendingHydrations).toHaveLength(1);
    expect(adapter.loadStack).not.toHaveBeenCalled();

    await pendingHydrations[0]!();

    expect(adapter.loadStack).toHaveBeenCalledWith(context.contextKey);
    expect(undoStackStore.getStore().state.undoMenu.canUndo).toBe(true);
    expect(undoStackStore.getStore().state.undoMenu.activeContextKey).toBe(context.contextKey);

    getIfLoadedSpy.mockRestore();
    hydrateSpy.mockRestore();
  });
});
