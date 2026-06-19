import { describe, expect, it } from 'vitest';
import {
  CATALOG_SOURCE_URL_UPDATED,
  CATALOG_TOKEN_KEY_UPDATED,
  THEME_COLOR_VARIABLE_LIGHT_SET,
  THEME_PALETTE_COLOR_ASSIGNED,
  THEME_PANE_SELECTIONS_SET,
} from '../../../model/undo-action-types';
import { catalogSchema } from '../../../model/schema/catalog';
import { undoDiffValuesEqual, undoValuesEqual } from './undo-values-equal';

describe('undo values equal', () => {
  it('compares primitives without serialization', () => {
    expect(undoValuesEqual('#111111', '#111111', THEME_COLOR_VARIABLE_LIGHT_SET)).toBe(true);
    expect(undoValuesEqual('#111111', '#222222', THEME_COLOR_VARIABLE_LIGHT_SET)).toBe(false);
  });

  it('compares pane selection objects structurally', () => {
    const before = { checkedColorRefs: ['a'], checkedContrastRefs: [] };
    const after = { checkedColorRefs: ['a'], checkedContrastRefs: [] };
    expect(undoDiffValuesEqual({
      actionType: THEME_PANE_SELECTIONS_SET,
      before,
      after,
    })).toBe(true);
  });

  it('compares palette assign patches without serializing whole themes', () => {
    const patch = {
      assignments: [{ colorRef: 'editorFg', light: '#111111', dark: '#222222' }],
    };
    expect(undoDiffValuesEqual({
      actionType: THEME_PALETTE_COLOR_ASSIGNED,
      before: patch,
      after: patch,
    })).toBe(true);
  });

  it('compares catalog source field patches structurally', () => {
    const before = { sourceIndex: 0, field: 'url' as const, value: 'https://old.example' };
    const after = { sourceIndex: 0, field: 'url' as const, value: 'https://new.example' };
    expect(undoDiffValuesEqual({
      actionType: CATALOG_SOURCE_URL_UPDATED,
      before,
      after,
    })).toBe(false);
  });

  it('detects catalog snapshot token list changes without whole-entity stringify', () => {
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
    expect(undoDiffValuesEqual({
      actionType: CATALOG_TOKEN_KEY_UPDATED,
      before,
      after,
    })).toBe(false);
  });
});
