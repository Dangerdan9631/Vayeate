import { describe, expect, it, vi } from 'vitest';
import { themeSchema } from '../../../model/schema/theme-schemas';
import { THEME_COLOR_VARIABLE_DARK_SET } from '../../../model/undo-action-types';
import { UndoStackStore } from '../../state/undo-stack/undo-stack-store';
import { RecordThemeUndoOperation } from './record-theme-undo-operation';
import { RecordUndoEntryOperation } from './record-undo-entry-operation';

describe('record theme undo operation', () => {
  it('skips recording when before and after are equal', async () => {
    const theme = themeSchema.parse({
      name: 'theme-a',
      version: '1.0.0',
      templateRef: { name: 'template-a', version: '1.0.0' },
      colorAssignments: [],
      contrastAssignments: [],
    });
    const recordUndoEntry = { execute: vi.fn() };
    const result = await new RecordThemeUndoOperation(
      recordUndoEntry as never,
      { execute: vi.fn() } as never,
    ).execute({
      description: 'Change dark color',
      actionType: THEME_COLOR_VARIABLE_DARK_SET,
      target: 'theme-a@1.0.0:editorFg:dark',
      before: theme,
      after: theme,
    });

    expect(result.status).toBe('not-recorded');
    expect(recordUndoEntry.execute).not.toHaveBeenCalled();
  });

  it('records changed theme snapshots with the universal processor', async () => {
    const before = themeSchema.parse({
      name: 'theme-a',
      version: '1.0.0',
      templateRef: { name: 'template-a', version: '1.0.0' },
      colorAssignments: [
        { colorRef: 'editorFg', dark: { value: '#111111' }, light: { value: '#eeeeee' }, useDarkForLight: false },
      ],
      contrastAssignments: [],
    });
    const after = themeSchema.parse({
      ...before,
      colorAssignments: [
        { colorRef: 'editorFg', dark: { value: '#222222' }, light: { value: '#eeeeee' }, useDarkForLight: false },
      ],
    });
    const processor = { handlerCount: 42 };
    const recordUndoEntry = {
      execute: vi.fn(async () => ({ status: 'recorded', entryId: 'entry-1' })),
    };
    const buildUniversalUndoProcessor = { execute: vi.fn(() => processor) };

    const result = await new RecordThemeUndoOperation(
      recordUndoEntry as never,
      buildUniversalUndoProcessor as never,
    ).execute({
      description: 'Change editorFg dark color',
      actionType: THEME_COLOR_VARIABLE_DARK_SET,
      target: 'theme-a@1.0.0:editorFg:dark',
      before,
      after,
    });

    expect(result.status).toBe('recorded');
    expect(recordUndoEntry.execute).toHaveBeenCalledWith({
      completed: true,
      description: 'Change editorFg dark color',
      diffs: [{
        actionType: THEME_COLOR_VARIABLE_DARK_SET,
        target: 'theme-a@1.0.0:editorFg:dark',
        before,
        after,
      }],
      processor,
    });
  });

  it('skips recording when no undo context is active', async () => {
    const undoStackStore = new UndoStackStore();
    const before = themeSchema.parse({
      name: 'theme-a',
      version: '1.0.0',
      templateRef: { name: 'template-a', version: '1.0.0' },
      colorAssignments: [],
      contrastAssignments: [],
    });
    const after = themeSchema.parse({
      ...before,
      colorAssignments: [
        { colorRef: 'editorFg', dark: { value: '#222222' }, light: { value: '#eeeeee' }, useDarkForLight: false },
      ],
    });

    const result = await new RecordThemeUndoOperation(
      new RecordUndoEntryOperation(undoStackStore),
      { execute: vi.fn(() => ({ applyProcessor: vi.fn(), revertProcessor: vi.fn() })) } as never,
    ).execute({
      description: 'Change editorFg dark color',
      actionType: THEME_COLOR_VARIABLE_DARK_SET,
      target: 'theme-a@1.0.0:editorFg:dark',
      before,
      after,
    });

    expect(result.status).toBe('not-recorded');
    expect(undoStackStore.getStore().state.undoMenu?.canUndo ?? false).toBe(false);
  });
});
