import { describe, expect, it, vi } from 'vitest';
import { createUndoManagerV2 } from '../../core/undo-manager-v2';
import { undoManagerV2 } from '../../core/undo-manager-v2';
import type { UndoProcessor } from '../../core/undo-stack-types';
import { RecordUndoEntryOperation } from './record-undo-entry-operation';

function store(stackId: string | null) {
  const state = {
    currentUndoStackId: stackId,
    undoListVersion: 0,
    undoMenu: null,
  };
  return {
    getStore: () => ({
      state,
      setUndoListVersion: (version: number) => {
        state.undoListVersion = version;
      },
      setUndoMenuSnapshot: (snapshot: never) => {
        state.undoMenu = snapshot;
      },
    }),
  };
}

function processor(): UndoProcessor {
  return {
    applyProcessor: vi.fn(),
    revertProcessor: vi.fn(),
  };
}

describe('record undo entry operation', () => {
  it('records completed reversible actions in the active context', async () => {
    const manager = createUndoManagerV2();
    const getOrCreateSpy = vi.spyOn(undoManagerV2, 'getOrCreate').mockImplementation(manager.getOrCreate);
    const undoStore = store('theme:active');

    const result = await new RecordUndoEntryOperation(undoStore as never).execute({
      completed: true,
      description: 'Change dark color',
      processor: processor(),
      diffs: [{ actionType: 'set-color', target: 'editorFg:dark', before: '#111111', after: '#222222' }],
    });

    expect(result.status).toBe('recorded');
    expect(undoStore.getStore().state.undoMenu).toMatchObject({
      activeContextKey: 'theme:active',
      canUndo: true,
      nextUndoDescription: 'Change dark color',
    });
    getOrCreateSpy.mockRestore();
  });

  it('does not record failed, no-op, or missing-context actions', async () => {
    const active = new RecordUndoEntryOperation(store('theme:active') as never);
    await expect(active.execute({
      completed: false,
      description: 'Failed change',
      processor: processor(),
      diffs: [{ actionType: 'set-color', target: 'editorFg:dark', before: '#111111', after: '#222222' }],
    })).resolves.toMatchObject({ status: 'not-recorded' });
    await expect(active.execute({
      completed: true,
      description: 'No diff',
      processor: processor(),
      diffs: [],
    })).resolves.toMatchObject({ status: 'not-recorded' });

    await expect(new RecordUndoEntryOperation(store(null) as never).execute({
      completed: true,
      description: 'Change dark color',
      processor: processor(),
      diffs: [{ actionType: 'set-color', target: 'editorFg:dark', before: '#111111', after: '#222222' }],
    })).resolves.toMatchObject({ status: 'not-recorded' });
  });

  it('does not record canceled, interrupted, validation-rejected, or duplicate-pending work', async () => {
    const active = new RecordUndoEntryOperation(store('theme:active') as never);
    const reversibleDiff = {
      actionType: 'set-color',
      target: 'editorFg:dark',
      before: '#111111',
      after: '#222222',
    };

    for (const description of [
      'Canceled picker commit',
      'Interrupted background save',
      'Validation rejected empty token',
      'Duplicate pending edit',
    ]) {
      await expect(active.execute({
        completed: false,
        description,
        processor: processor(),
        diffs: [reversibleDiff],
      })).resolves.toMatchObject({ status: 'not-recorded' });
    }
  });

  it('does not expose a history summary when recording fails', async () => {
    const manager = createUndoManagerV2({
      persistence: {
        saveStack: vi.fn(async () => {
          throw new Error('write failed');
        }),
        loadStack: vi.fn(async () => null),
        clearPersisted: vi.fn(),
      },
    });
    const getOrCreateSpy = vi.spyOn(undoManagerV2, 'getOrCreate').mockImplementation(manager.getOrCreate);
    const undoStore = store('theme:active');

    await new RecordUndoEntryOperation(undoStore as never).execute({
      completed: true,
      description: 'Change dark color',
      processor: processor(),
      diffs: [{ actionType: 'set-color', target: 'editorFg:dark', before: '#111111', after: '#222222' }],
    });

    expect(undoStore.getStore().state.undoMenu).toBeNull();
    getOrCreateSpy.mockRestore();
  });

  it('reports persistence failures instead of presenting an entry as undoable', async () => {
    const manager = createUndoManagerV2({
      persistence: {
        saveStack: vi.fn(async () => {
          throw new Error('disk full');
        }),
        loadStack: vi.fn(async () => null),
        clearPersisted: vi.fn(),
      },
    });
    const getOrCreateSpy = vi.spyOn(undoManagerV2, 'getOrCreate').mockImplementation(manager.getOrCreate);

    const result = await new RecordUndoEntryOperation(store('theme:active') as never).execute({
      completed: true,
      description: 'Change dark color',
      processor: processor(),
      diffs: [{ actionType: 'set-color', target: 'editorFg:dark', before: '#111111', after: '#222222' }],
    });

    expect(result).toMatchObject({ status: 'failed', message: 'disk full' });
    getOrCreateSpy.mockRestore();
  });
});
