import { describe, expect, it, vi } from 'vitest';
import { templateSchema } from '../../../model/schema/template-schemas';
import { TEMPLATE_COLOR_VARIABLE_ADDED } from '../../../model/undo-action-types';
import { UndoStackStore } from '../../state/undo-stack/undo-stack-store';
import { RecordTemplateUndoOperation } from './record-template-undo-operation';
import { RecordUndoEntryOperation } from './record-undo-entry-operation';

describe('record template undo operation', () => {
  it('skips recording when before and after are equal', async () => {
    const template = templateSchema.parse({
      name: 'template-a',
      version: '1.0.0',
      locked: false,
      catalogRefs: [],
      mappings: [],
      colorVariables: [],
      contrastVariables: [],
      groups: [],
    });
    const recordUndoEntry = { execute: vi.fn() };
    const result = await new RecordTemplateUndoOperation(
      recordUndoEntry as never,
      { execute: vi.fn() } as never,
    ).execute({
      description: 'Add variable',
      actionType: TEMPLATE_COLOR_VARIABLE_ADDED,
      target: 'template-a@1.0.0:color-variable:editorFg',
      before: template,
      after: template,
    });

    expect(result.status).toBe('not-recorded');
    expect(recordUndoEntry.execute).not.toHaveBeenCalled();
  });

  it('records changed template snapshots with the universal processor', async () => {
    const before = templateSchema.parse({
      name: 'template-a',
      version: '1.0.0',
      locked: false,
      catalogRefs: [],
      mappings: [],
      colorVariables: [],
      contrastVariables: [],
      groups: [],
    });
    const after = templateSchema.parse({
      name: 'template-a',
      version: '1.0.0',
      locked: false,
      catalogRefs: [],
      mappings: [],
      colorVariables: [{ key: 'editorFg', groupRef: null }],
      contrastVariables: [],
      groups: [],
    });
    const processor = { handlerCount: 42 };
    const recordUndoEntry = {
      execute: vi.fn(async () => ({ status: 'recorded', entryId: 'entry-1' })),
    };
    const buildUniversalUndoProcessor = { execute: vi.fn(() => processor) };

    const result = await new RecordTemplateUndoOperation(
      recordUndoEntry as never,
      buildUniversalUndoProcessor as never,
    ).execute({
      description: 'Add editorFg color variable',
      actionType: TEMPLATE_COLOR_VARIABLE_ADDED,
      target: 'template-a@1.0.0:color-variable:editorFg',
      before,
      after,
    });

    expect(result.status).toBe('recorded');
    expect(recordUndoEntry.execute).toHaveBeenCalledWith({
      completed: true,
      description: 'Add editorFg color variable',
      diffs: [{
        actionType: TEMPLATE_COLOR_VARIABLE_ADDED,
        target: 'template-a@1.0.0:color-variable:editorFg',
        before,
        after,
      }],
      processor,
    });
  });

  it('skips recording when no undo context is active', async () => {
    const undoStackStore = new UndoStackStore();
    const before = templateSchema.parse({
      name: 'template-a',
      version: '1.0.0',
      locked: false,
      catalogRefs: [],
      mappings: [],
      colorVariables: [],
      contrastVariables: [],
      groups: [],
    });
    const after = templateSchema.parse({
      ...before,
      colorVariables: [{ key: 'editorFg', groupRef: null }],
    });

    const result = await new RecordTemplateUndoOperation(
      new RecordUndoEntryOperation(undoStackStore),
      { execute: vi.fn(() => ({ applyProcessor: vi.fn(), revertProcessor: vi.fn() })) } as never,
    ).execute({
      description: 'Add editorFg color variable',
      actionType: TEMPLATE_COLOR_VARIABLE_ADDED,
      target: 'template-a@1.0.0:color-variable:editorFg',
      before,
      after,
    });

    expect(result.status).toBe('not-recorded');
    expect(undoStackStore.getStore().state.undoMenu?.canUndo ?? false).toBe(false);
  });
});
