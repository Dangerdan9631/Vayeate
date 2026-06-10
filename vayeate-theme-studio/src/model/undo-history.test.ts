import { describe, expect, it } from 'vitest';
import { deriveUndoContext, undoDiffSchema } from './undo-history';

describe('undo history model', () => {
  it('derives stable context keys from active tab and existing refs', () => {
    const context = deriveUndoContext({
      tabId: 'themes',
      templateRef: { name: 'base-template', version: '1.0.0' },
      catalogRef: { name: 'core-catalog', version: '2.0.0' },
      themeRef: { name: 'dark-theme', version: '3.0.0' },
    });

    expect(context.contextKey).toBe(
      'tab=themes|template=base-template@1.0.0|catalog=core-catalog@2.0.0|theme=dark-theme@3.0.0',
    );
    expect(deriveUndoContext({
      tabId: 'themes',
      templateRef: { name: 'base-template', version: '1.0.0' },
      catalogRef: { name: 'core-catalog', version: '2.0.0' },
      themeRef: { name: 'dark-theme', version: '3.0.0' },
    }).contextKey).toBe(context.contextKey);
  });

  it('changes context keys when any visible context ref changes', () => {
    const base = deriveUndoContext({
      tabId: 'templates',
      templateRef: { name: 'base-template', version: '1.0.0' },
    });
    const changedTab = deriveUndoContext({
      tabId: 'themes',
      templateRef: { name: 'base-template', version: '1.0.0' },
    });
    const changedVersion = deriveUndoContext({
      tabId: 'templates',
      templateRef: { name: 'base-template', version: '1.0.1' },
    });

    expect(changedTab.contextKey).not.toBe(base.contextKey);
    expect(changedVersion.contextKey).not.toBe(base.contextKey);
  });

  it('includes catalog and theme reference changes in active context identity', () => {
    const base = deriveUndoContext({
      tabId: 'themes',
      templateRef: { name: 'base-template', version: '1.0.0' },
      catalogRef: { name: 'core-catalog', version: '2.0.0' },
      themeRef: { name: 'dark-theme', version: '3.0.0' },
    });

    expect(deriveUndoContext({
      tabId: 'themes',
      templateRef: { name: 'base-template', version: '1.0.0' },
      catalogRef: { name: 'alternate-catalog', version: '2.0.0' },
      themeRef: { name: 'dark-theme', version: '3.0.0' },
    }).contextKey).not.toBe(base.contextKey);

    expect(deriveUndoContext({
      tabId: 'themes',
      templateRef: { name: 'base-template', version: '1.0.0' },
      catalogRef: { name: 'core-catalog', version: '2.0.0' },
      themeRef: { name: 'dark-theme', version: '3.0.1' },
    }).contextKey).not.toBe(base.contextKey);
  });

  it('marks missing refs explicitly so partial contexts do not collide', () => {
    const catalogOnly = deriveUndoContext({
      tabId: 'catalogs',
      catalogRef: { name: 'core-catalog', version: '2.0.0' },
    });
    const templateOnly = deriveUndoContext({
      tabId: 'catalogs',
      templateRef: { name: 'core-catalog', version: '2.0.0' },
    });

    expect(catalogOnly.contextKey).toBe(
      'tab=catalogs|template=none|catalog=core-catalog@2.0.0|theme=none',
    );
    expect(templateOnly.contextKey).toBe(
      'tab=catalogs|template=core-catalog@2.0.0|catalog=none|theme=none',
    );
    expect(catalogOnly.contextKey).not.toBe(templateOnly.contextKey);
  });

  it('encodes ref delimiters before building the context key', () => {
    const context = deriveUndoContext({
      tabId: 'templates',
      templateRef: { name: 'template|name', version: '1.0@beta' },
    });

    expect(context.contextKey).toBe(
      'tab=templates|template=template%7Cname@1.0%40beta|catalog=none|theme=none',
    );
  });

  it('accepts focused before and after diff payloads without whole app snapshots', () => {
    const diff = undoDiffSchema.parse({
      actionType: 'THEME_VARIABLE_COLOR_SET',
      target: 'theme:dark-theme@3.0.0:color:editorFg:dark',
      before: { value: '#111111' },
      after: { value: '#eeeeee' },
    });

    expect(diff).toEqual({
      actionType: 'THEME_VARIABLE_COLOR_SET',
      target: 'theme:dark-theme@3.0.0:color:editorFg:dark',
      before: { value: '#111111' },
      after: { value: '#eeeeee' },
    });
  });
});
