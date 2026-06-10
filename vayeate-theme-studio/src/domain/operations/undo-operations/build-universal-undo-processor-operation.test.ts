import { describe, expect, it, vi } from 'vitest';
import {
  CATALOG_TOKEN_KEY_UPDATED,
  TEMPLATE_GROUP_ADDED,
  THEME_COLOR_VARIABLE_LIGHT_SET,
  THEME_PALETTE_HUE_ADJUSTMENT_SET,
} from '../../../model/undo-action-types';
import { BuildUniversalUndoProcessorOperation } from './build-universal-undo-processor-operation';

function buildProcessor() {
  const applyCatalogUndoState = { execute: vi.fn() };
  const applyTemplateUndoState = { execute: vi.fn() };
  const applyThemeUndoState = { execute: vi.fn() };
  const commitAssignColorText = { restore: vi.fn() };
  const setColorVariableLight = { execute: vi.fn() };
  const setColorVariableDark = { execute: vi.fn() };
  const setHueAdjustment = { execute: vi.fn() };
  const setHueReferenceHex = { execute: vi.fn() };
  const setLoadedTemplate = { execute: vi.fn() };

  const processor = new BuildUniversalUndoProcessorOperation(
    applyCatalogUndoState as never,
    applyTemplateUndoState as never,
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
    applyTemplateUndoState,
    applyThemeUndoState,
    setColorVariableLight,
    setHueAdjustment,
  };
}

describe('build universal undo processor operation', () => {
  it('registers handlers for catalog, template, and theme action types', () => {
    const { processor } = buildProcessor();
    expect(processor.handlerCount).toBeGreaterThan(50);
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
