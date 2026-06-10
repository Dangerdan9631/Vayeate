import { describe, expect, it, vi } from 'vitest';
import { undoManagerV2 } from '../../core/undo-manager-v2';
import { UndoStackStore } from '../../state/undo-stack/undo-stack-store';
import { deriveUndoContext } from '../../../model/undo-history';
import { SetCurrentUndoStackIdOperation } from './set-current-undo-stack-id-operation';

describe('set current undo stack id operation', () => {
  it('reloads the last known context for a tab when switching back', async () => {
    await undoManagerV2.clearPersisted();
    const undoStackStore = new UndoStackStore();
    const operation = new SetCurrentUndoStackIdOperation(
      undoStackStore,
      { execute: vi.fn(() => ({ applyProcessor: vi.fn(), revertProcessor: vi.fn() })) } as never,
    );
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
    await operation.executeAndLoadForTab('themes', fallbackThemeContext);

    expect(undoStackStore.getStore().state.currentUndoStackId).toBe(originalThemeContext.contextKey);
    expect(undoStackStore.getStore().state.undoMenu.activeContextKey).toBe(originalThemeContext.contextKey);
  });
});
