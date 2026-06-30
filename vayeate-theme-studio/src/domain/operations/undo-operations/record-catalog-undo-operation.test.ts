import { describe, expect, it, vi } from 'vitest';
import { catalogSchema } from '../../../model/schema/catalog';
import { CATALOG_TOKEN_KEY_UPDATED } from '../../../model/undo-action-types';
import { UndoStackStore } from '../../state/undo-stack/undo-stack-store';
import { RecordCatalogUndoOperation } from './record-catalog-undo-operation';
import { RecordUndoEntryOperation } from './record-undo-entry-operation';

describe('record catalog undo operation', () => {
  it('skips recording when before and after are equal', async () => {
    const catalog = catalogSchema.parse({
      name: 'catalog-a',
      version: '1.0.0',
      type: 'manual',
      locked: false,
      sources: [],
      tokens: [],
    });
    const recordUndoEntry = { execute: vi.fn() };
    const result = await new RecordCatalogUndoOperation(
      recordUndoEntry as never,
      { execute: vi.fn() } as never,
    ).execute({
      description: 'Rename token',
      actionType: CATALOG_TOKEN_KEY_UPDATED,
      target: 'catalog-a@1.0.0:theme:editorFg',
      before: catalog,
      after: catalog,
    });

    expect(result.status).toBe('not-recorded');
    expect(recordUndoEntry.execute).not.toHaveBeenCalled();
  });

  it('records changed catalog snapshots with the universal processor', async () => {
    const before = catalogSchema.parse({
      name: 'catalog-a',
      version: '1.0.0',
      type: 'manual',
      locked: false,
      sources: [],
      tokens: [],
    });
    const after = catalogSchema.parse({
      name: 'catalog-a',
      version: '1.0.0',
      type: 'manual',
      locked: false,
      sources: [],
      tokens: [{ key: 'editorFg', type: 'theme' }],
    });
    const processor = { handlerCount: 42 };
    const recordUndoEntry = {
      execute: vi.fn(async () => ({ status: 'recorded', entryId: 'entry-1' })),
    };
    const buildUniversalUndoProcessor = { execute: vi.fn(() => processor) };

    const result = await new RecordCatalogUndoOperation(
      recordUndoEntry as never,
      buildUniversalUndoProcessor as never,
    ).execute({
      description: 'Rename token',
      actionType: CATALOG_TOKEN_KEY_UPDATED,
      target: 'catalog-a@1.0.0:theme:editorFg',
      before,
      after,
    });

    expect(result.status).toBe('recorded');
    expect(recordUndoEntry.execute).toHaveBeenCalledWith({
      completed: true,
      description: 'Rename token',
      diffs: [{
        actionType: CATALOG_TOKEN_KEY_UPDATED,
        target: 'catalog-a@1.0.0:theme:editorFg',
        before,
        after,
      }],
      processor,
    });
  });

  it('skips recording when no undo context is active', async () => {
    const undoStackStore = new UndoStackStore();
    const before = catalogSchema.parse({
      name: 'catalog-a',
      version: '1.0.0',
      type: 'manual',
      locked: false,
      sources: [],
      tokens: [],
    });
    const after = catalogSchema.parse({
      ...before,
      tokens: [{ key: 'editorFg', type: 'theme' }],
    });

    const result = await new RecordCatalogUndoOperation(
      new RecordUndoEntryOperation(undoStackStore),
      { execute: vi.fn(() => ({ applyProcessor: vi.fn(), revertProcessor: vi.fn() })) } as never,
    ).execute({
      description: 'Rename token',
      actionType: CATALOG_TOKEN_KEY_UPDATED,
      target: 'catalog-a@1.0.0:theme:editorFg',
      before,
      after,
    });

    expect(result.status).toBe('not-recorded');
    expect(undoStackStore.getStore().state.undoMenu?.canUndo ?? false).toBe(false);
  });
});
