import { describe, expect, it, vi } from 'vitest';
import { createUndoManagerV2 } from '../../core/undo-manager-v2';
import { undoManagerV2 } from '../../core/undo-manager-v2';
import type { UndoProcessor } from '../../core/undo-stack-types';
import { THEME_PANE_SELECTIONS_SET } from '../../../model/undo-action-types';
import { RecordUndoEntryOperation } from './record-undo-entry-operation';

function store(stackId: string | null) {
  const state = {
    currentUndoStackId: stackId,
    currentBaselineLabel: 'Opened',
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
      setCurrentBaselineLabel: (label: string) => {
        state.currentBaselineLabel = label;
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

  it('collapses adjacent same-target entries when requested', async () => {
    const manager = createUndoManagerV2();
    const getOrCreateSpy = vi.spyOn(undoManagerV2, 'getOrCreate').mockImplementation(manager.getOrCreate);
    const undoStore = store('theme:active');
    const operation = new RecordUndoEntryOperation(undoStore as never);

    const first = await operation.execute({
      completed: true,
      description: 'Select editor foreground',
      processor: processor(),
      diffs: [{
        actionType: THEME_PANE_SELECTIONS_SET,
        target: 'theme:pane-selections',
        before: { checkedColorRefs: [], checkedContrastRefs: [] },
        after: { checkedColorRefs: ['editor.foreground'], checkedContrastRefs: [] },
      }],
      coalesceWithPrevious: true,
    });
    const second = await operation.execute({
      completed: true,
      description: 'Select editor background',
      processor: processor(),
      diffs: [{
        actionType: THEME_PANE_SELECTIONS_SET,
        target: 'theme:pane-selections',
        before: { checkedColorRefs: ['editor.foreground'], checkedContrastRefs: [] },
        after: { checkedColorRefs: ['editor.foreground', 'editor.background'], checkedContrastRefs: [] },
      }],
      coalesceWithPrevious: true,
    });

    expect(first.status).toBe('recorded');
    expect(second.status).toBe('recorded');
    expect(undoStore.getStore().state.undoMenu).toMatchObject({
      canUndo: true,
      nextUndoDescription: 'Select editor background',
      recentActions: [{ description: 'Select editor background' }],
    });
    getOrCreateSpy.mockRestore();
  });

  it('pops coalesced frame when merged diffs net to no change', async () => {
    const manager = createUndoManagerV2();
    const getOrCreateSpy = vi.spyOn(undoManagerV2, 'getOrCreate').mockImplementation(manager.getOrCreate);
    const undoStore = store('theme:active');
    const operation = new RecordUndoEntryOperation(undoStore as never);
    const selection = {
      checkedColorRefs: ['editor.foreground'],
      checkedContrastRefs: [] as string[],
    };

    await operation.execute({
      completed: true,
      description: 'Select editor foreground',
      processor: processor(),
      diffs: [{
        actionType: THEME_PANE_SELECTIONS_SET,
        target: 'theme:pane-selections',
        before: { checkedColorRefs: [], checkedContrastRefs: [] },
        after: selection,
      }],
      coalesceWithPrevious: true,
    });
    await operation.execute({
      completed: true,
      description: 'Clear editor foreground selection',
      processor: processor(),
      diffs: [{
        actionType: THEME_PANE_SELECTIONS_SET,
        target: 'theme:pane-selections',
        before: selection,
        after: { checkedColorRefs: [], checkedContrastRefs: [] },
      }],
      coalesceWithPrevious: true,
    });

    expect(undoStore.getStore().state.undoMenu).toMatchObject({
      canUndo: false,
      nextUndoDescription: null,
      recentActions: [],
    });
    getOrCreateSpy.mockRestore();
  });

  it('does not collapse adjacent coalesced entries with different targets', async () => {
    const manager = createUndoManagerV2();
    const getOrCreateSpy = vi.spyOn(undoManagerV2, 'getOrCreate').mockImplementation(manager.getOrCreate);
    const undoStore = store('theme:active');
    const operation = new RecordUndoEntryOperation(undoStore as never);

    await operation.execute({
      completed: true,
      description: 'Color variable selection changed',
      processor: processor(),
      diffs: [{ actionType: 'set-selection', target: 'theme:pane-selections:color-variable', before: [], after: ['editor.foreground'] }],
      coalesceWithPrevious: true,
    });
    await operation.execute({
      completed: true,
      description: 'Contrast variable selection changed',
      processor: processor(),
      diffs: [{ actionType: 'set-selection', target: 'theme:pane-selections:contrast-variable', before: [], after: ['editor.contrast'] }],
      coalesceWithPrevious: true,
    });

    expect(undoStore.getStore().state.undoMenu).toMatchObject({
      nextUndoDescription: 'Contrast variable selection changed',
      recentActions: [
        { description: 'Color variable selection changed' },
        { description: 'Contrast variable selection changed' },
      ],
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

  it('records the entry before asynchronous persistence completes', async () => {
    const pendingRuns: Array<() => void | Promise<void>> = [];
    const manager = createUndoManagerV2({
      persistence: {
        saveStack: vi.fn(async () => {
          throw new Error('write failed');
        }),
        loadStack: vi.fn(async () => null),
        clearPersisted: vi.fn(),
      },
      persistEnqueue: (_description, run) => {
        pendingRuns.push(run);
      },
    });
    const getOrCreateSpy = vi.spyOn(undoManagerV2, 'getOrCreate').mockImplementation(manager.getOrCreate);
    const undoStore = store('theme:active');

    const result = await new RecordUndoEntryOperation(undoStore as never).execute({
      completed: true,
      description: 'Change dark color',
      processor: processor(),
      diffs: [{ actionType: 'set-color', target: 'editorFg:dark', before: '#111111', after: '#222222' }],
    });

    expect(result.status).toBe('recorded');
    expect(undoStore.getStore().state.undoMenu).not.toBeNull();
    const persistPromise = manager.flushPendingPersists('theme:active');
    await expect(pendingRuns[0]!()).rejects.toThrow('write failed');
    await expect(persistPromise).rejects.toThrow('write failed');
    getOrCreateSpy.mockRestore();
  });

  it('does not fail recording when persistence fails asynchronously', async () => {
    const pendingRuns: Array<() => void | Promise<void>> = [];
    const manager = createUndoManagerV2({
      persistence: {
        saveStack: vi.fn(async () => {
          throw new Error('disk full');
        }),
        loadStack: vi.fn(async () => null),
        clearPersisted: vi.fn(),
      },
      persistEnqueue: (_description, run) => {
        pendingRuns.push(run);
      },
    });
    const getOrCreateSpy = vi.spyOn(undoManagerV2, 'getOrCreate').mockImplementation(manager.getOrCreate);

    const result = await new RecordUndoEntryOperation(store('theme:active') as never).execute({
      completed: true,
      description: 'Change dark color',
      processor: processor(),
      diffs: [{ actionType: 'set-color', target: 'editorFg:dark', before: '#111111', after: '#222222' }],
    });

    expect(result.status).toBe('recorded');
    const persistPromise = manager.flushPendingPersists('theme:active');
    await expect(pendingRuns[0]!()).rejects.toThrow('disk full');
    await expect(persistPromise).rejects.toThrow('disk full');
    getOrCreateSpy.mockRestore();
  });
});
