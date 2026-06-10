import { describe, expect, it, vi } from 'vitest';
import { catalogSchema } from '../../../model/schema/catalog';
import { templateSchema } from '../../../model/schema/template-schemas';
import { themeSchema } from '../../../model/schema/theme-schemas';
import {
  CATALOG_CREATED,
  CATALOG_REVERTED_TO_VERSION,
  CATALOG_TOKEN_KEY_UPDATED,
  CATALOG_UNDO_ACTION_TYPES,
  CATALOG_VERSION_DELETED,
  TEMPLATE_CREATED,
  TEMPLATE_GROUP_ADDED,
  TEMPLATE_UNDO_ACTION_TYPES,
  TEMPLATE_VERSION_DELETED,
  THEME_COLOR_VARIABLE_DARK_SET,
  THEME_COLOR_VARIABLE_LIGHT_SET,
  THEME_CREATED,
  THEME_LOADED_TEMPLATE_SET,
  THEME_PALETTE_COLOR_ASSIGNED,
  THEME_PALETTE_HUE_ADJUSTMENT_SET,
  THEME_PALETTE_HUE_REFERENCE_SET,
  THEME_UNDO_ACTION_TYPES,
  THEME_VERSION_DELETED,
  THEME_VERSION_INCREMENTED,
} from '../../../model/undo-action-types';
import { BuildUniversalUndoProcessorOperation } from './build-universal-undo-processor-operation';

function buildProcessor() {
  const applyCatalogUndoState = { execute: vi.fn() };
  const applyCatalogLifecycleUndo = {
    applyVersionDeleted: vi.fn(),
    revertVersionDeleted: vi.fn(),
    applyCreated: vi.fn(),
    revertCreated: vi.fn(),
    applyRevertedToVersion: vi.fn(),
    revertRevertedToVersion: vi.fn(),
  };
  const applyTemplateLifecycleUndo = {
    applyVersionDeleted: vi.fn(),
    revertVersionDeleted: vi.fn(),
    applyCreated: vi.fn(),
    revertCreated: vi.fn(),
  };
  const applyTemplateUndoState = { execute: vi.fn() };
  const applyThemeLifecycleUndo = {
    applyVersionDeleted: vi.fn(),
    revertVersionDeleted: vi.fn(),
    applyVersionIncremented: vi.fn(),
    revertVersionIncremented: vi.fn(),
    applyCreated: vi.fn(),
    revertCreated: vi.fn(),
  };
  const applyThemeUndoState = { execute: vi.fn() };
  const commitAssignColorText = { restore: vi.fn() };
  const setColorVariableLight = { execute: vi.fn() };
  const setColorVariableDark = { execute: vi.fn() };
  const setHueAdjustment = { execute: vi.fn() };
  const setHueReferenceHex = { execute: vi.fn() };
  const setLoadedTemplate = { execute: vi.fn() };

  const processor = new BuildUniversalUndoProcessorOperation(
    applyCatalogUndoState as never,
    applyCatalogLifecycleUndo as never,
    applyTemplateLifecycleUndo as never,
    applyTemplateUndoState as never,
    applyThemeLifecycleUndo as never,
    applyThemeUndoState as never,
    commitAssignColorText as never,
    setColorVariableLight as never,
    setColorVariableDark as never,
    setHueAdjustment as never,
    setHueReferenceHex as never,
    setLoadedTemplate as never,
  ).execute();

  return {
    processor,
    applyCatalogUndoState,
    applyCatalogLifecycleUndo,
    applyTemplateLifecycleUndo,
    applyThemeLifecycleUndo,
    applyTemplateUndoState,
    applyThemeUndoState,
    commitAssignColorText,
    setColorVariableLight,
    setColorVariableDark,
    setHueAdjustment,
    setHueReferenceHex,
    setLoadedTemplate,
  };
}

const catalogSnapshot = catalogSchema.parse({
  name: 'catalog-a',
  version: '1.0.0',
  type: 'manual',
  locked: false,
  sources: [],
  tokens: [],
});

const templateSnapshot = templateSchema.parse({
  name: 'template-a',
  version: '1.0.0',
  locked: false,
  catalogRefs: [],
  mappings: [],
  colorVariables: [],
  contrastVariables: [],
  groups: [],
});

const themeSnapshot = themeSchema.parse({
  name: 'theme-a',
  version: '1.0.0',
  templateRef: { name: 'template-a', version: '1.0.0' },
  colorAssignments: [],
  contrastAssignments: [],
});

function diffForActionType(actionType: string): { target: string; before: unknown; after: unknown } {
  if (actionType === CATALOG_VERSION_DELETED || actionType === CATALOG_CREATED) {
    return {
      target: 'catalog-a@1.0.0',
      before: { catalog: catalogSnapshot, selectedRef: { name: 'catalog-a', version: '1.0.0' } },
      after: { catalog: null, selectedRef: null },
    };
  }
  if (actionType === CATALOG_REVERTED_TO_VERSION) {
    return {
      target: 'catalog-a@1.0.0',
      before: { deleteVersion: { name: 'catalog-a', version: '1.0.1' }, selectedRef: { name: 'catalog-a', version: '1.0.0' } },
      after: catalogSnapshot,
    };
  }
  if (actionType === TEMPLATE_VERSION_DELETED || actionType === TEMPLATE_CREATED) {
    return {
      target: 'template-a@1.0.0',
      before: { template: templateSnapshot, selectedRef: { name: 'template-a', version: '1.0.0' } },
      after: { template: null, selectedRef: null },
    };
  }
  if (actionType === THEME_VERSION_DELETED || actionType === THEME_VERSION_INCREMENTED || actionType === THEME_CREATED) {
    return {
      target: 'theme-a@1.0.0',
      before: { theme: null, selectedRef: { name: 'theme-a', version: '1.0.0' } },
      after: { theme: themeSnapshot, selectedRef: { name: 'theme-a', version: '1.0.0' } },
    };
  }
  if (actionType === THEME_PALETTE_COLOR_ASSIGNED) {
    return { target: 'theme-a@1.0.0:palette', before: themeSnapshot, after: themeSnapshot };
  }
  if (actionType === THEME_COLOR_VARIABLE_LIGHT_SET || actionType === THEME_COLOR_VARIABLE_DARK_SET) {
    return { target: 'editorFg', before: '#111111', after: '#222222' };
  }
  if (actionType === THEME_PALETTE_HUE_ADJUSTMENT_SET) {
    return { target: 'theme-a@1.0.0:hue-adjustment', before: 12, after: 0 };
  }
  if (actionType === THEME_PALETTE_HUE_REFERENCE_SET) {
    return { target: 'theme-a@1.0.0:hue-reference', before: '#ff0000', after: '#00ff00' };
  }
  if (actionType === THEME_LOADED_TEMPLATE_SET) {
    return { target: 'theme-a@1.0.0:loaded-template', before: null, after: templateSnapshot };
  }
  if (CATALOG_UNDO_ACTION_TYPES.includes(actionType as typeof CATALOG_UNDO_ACTION_TYPES[number])) {
    return { target: 'catalog-a@1.0.0', before: catalogSnapshot, after: catalogSnapshot };
  }
  if (TEMPLATE_UNDO_ACTION_TYPES.includes(actionType as typeof TEMPLATE_UNDO_ACTION_TYPES[number])) {
    return { target: 'template-a@1.0.0', before: templateSnapshot, after: templateSnapshot };
  }
  return { target: 'theme-a@1.0.0', before: themeSnapshot, after: themeSnapshot };
}

describe('build universal undo processor operation', () => {
  it('registers handlers for catalog, template, and theme action types', () => {
    const { processor } = buildProcessor();
    const registeredCount =
      CATALOG_UNDO_ACTION_TYPES.length
      + TEMPLATE_UNDO_ACTION_TYPES.length
      + THEME_UNDO_ACTION_TYPES.length;
    expect(processor.handlerCount).toBe(registeredCount);
  });

  it('replays every registered action type through apply and revert handlers', async () => {
    const deps = buildProcessor();
    const allActionTypes = [
      ...CATALOG_UNDO_ACTION_TYPES,
      ...TEMPLATE_UNDO_ACTION_TYPES,
      ...THEME_UNDO_ACTION_TYPES,
    ];

    for (const actionType of allActionTypes) {
      const diff = diffForActionType(actionType);
      await expect(deps.processor.applyProcessor({
        actionType,
        target: diff.target,
        before: diff.before,
        after: diff.after,
      })).resolves.toBeUndefined();
      await expect(deps.processor.revertProcessor({
        actionType,
        target: diff.target,
        before: diff.before,
        after: diff.after,
      })).resolves.toBeUndefined();
    }
  });

  it('replays catalog snapshot diffs through apply catalog undo state', async () => {
    const { processor, applyCatalogUndoState } = buildProcessor();
    const before = { name: 'catalog-a', version: '1.0.0' };
    const after = { name: 'catalog-a', version: '1.0.1' };

    await processor.applyProcessor({
      actionType: CATALOG_TOKEN_KEY_UPDATED,
      target: 'catalog-a@1.0.0:theme:editorFg',
      before,
      after,
    });
    await processor.revertProcessor({
      actionType: CATALOG_TOKEN_KEY_UPDATED,
      target: 'catalog-a@1.0.0:theme:editorFg',
      before,
      after,
    });

    expect(applyCatalogUndoState.execute).toHaveBeenNthCalledWith(1, after);
    expect(applyCatalogUndoState.execute).toHaveBeenNthCalledWith(2, before);
  });

  it('replays template snapshot diffs through apply template undo state', async () => {
    const { processor, applyTemplateUndoState } = buildProcessor();
    const before = { name: 'template-a', version: '1.0.0' };
    const after = { name: 'template-a', version: '1.0.1' };

    await processor.applyProcessor({
      actionType: TEMPLATE_GROUP_ADDED,
      target: 'template-a@1.0.0:group:core',
      before,
      after,
    });

    expect(applyTemplateUndoState.execute).toHaveBeenCalledWith(after);
  });

  it('replays specialized theme color-variable diffs', async () => {
    const { processor, setColorVariableLight } = buildProcessor();

    await processor.applyProcessor({
      actionType: THEME_COLOR_VARIABLE_LIGHT_SET,
      target: 'editorFg',
      before: '#111111',
      after: '#222222',
    });

    expect(setColorVariableLight.execute).toHaveBeenCalledWith('editorFg', '#222222');
  });

  it('replays theme hue adjustment diffs through the UI operation', async () => {
    const { processor, setHueAdjustment } = buildProcessor();

    await processor.revertProcessor({
      actionType: THEME_PALETTE_HUE_ADJUSTMENT_SET,
      target: 'theme-a@1.0.0:hue-adjustment',
      before: 12,
      after: 0,
    });

    expect(setHueAdjustment.execute).toHaveBeenCalledWith(12);
  });
});
