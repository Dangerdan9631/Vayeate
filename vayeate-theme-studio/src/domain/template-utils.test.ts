import { describe, expect, it } from 'vitest';
import { mergeMappingsFromCatalogData } from './utils/template-catalog-merge';
import { isMappingOrphanForTemplate } from './utils/is-mapping-orphan-for-template';
import { formatSemanticSelector } from '../model/format-semantic-selector';
import { parseSemanticSelector } from '../model/parse-semantic-selector';
import { CreateTemplateDialogStore } from './state/ui/create-template-dialog-store';

describe('template utility baselines', () => {
  it('parses and formats semantic selectors canonically', () => {
    expect(parseSemanticSelector('variable.readonly:typescript')).toEqual({
      type: 'variable',
      modifiers: ['readonly'],
      language: 'typescript',
    });
    expect(formatSemanticSelector('variable', ['readonly', 'declaration'], 'typescript')).toBe(
      'variable.declaration.readonly:typescript',
    );
  });

  it('merges catalog tokens into mappings while preserving mapped or orphaned assignments', () => {
    const result = mergeMappingsFromCatalogData(
      [
        {
          ref: { name: 'catalog-a', version: '1.0.0' },
          tokens: [
            { key: 'editor.foreground', type: 'theme' },
            { key: 'keyword.control', type: 'textmate token' },
          ],
          semanticTokenTypes: ['variable'],
          semanticTokenModifiers: ['readonly'],
          semanticTokenLanguages: ['typescript'],
        },
      ],
      [
        {
          token: { key: 'editor.foreground', type: 'theme' },
          colorVariableRef: 'editorFg',
          contrastVariableRef: null,
          groupRef: 'existing',
        },
        {
          token: { key: 'missing.token', type: 'theme' },
          colorVariableRef: 'keepMe',
          contrastVariableRef: null,
          groupRef: 'legacy',
        },
      ],
    );

    expect(result.groupsToEnsure).toContain('catalog-a');
    expect(result.mappings).toContainEqual({
      token: { key: 'keyword.control', type: 'textmate token' },
      colorVariableRef: null,
      contrastVariableRef: null,
      groupRef: 'catalog-a',
    });
    expect(result.mappings).toContainEqual({
      token: { key: 'variable', type: 'semantic token' },
      colorVariableRef: null,
      contrastVariableRef: null,
      groupRef: 'catalog-a',
    });
    expect(result.mappings).toContainEqual({
      token: { key: 'missing.token', type: 'theme' },
      colorVariableRef: 'keepMe',
      contrastVariableRef: null,
      groupRef: 'legacy',
    });
    expect(result.semanticTokenModifiers).toEqual(['readonly']);
    expect(result.semanticTokenLanguages).toEqual(['typescript']);
  });

  it('detects orphan mappings only when all template catalogs are loaded', () => {
    const template = {
      name: 'template-a',
      version: '1.0.0',
      locked: false,
      catalogRefs: [{ name: 'catalog-a', version: '1.0.0' }],
      mappings: [
        {
          token: { key: 'editor.foreground', type: 'theme' as const },
          colorVariableRef: 'editorFg',
          contrastVariableRef: null,
          groupRef: null,
        },
        {
          token: { key: 'missing.token', type: 'theme' as const },
          colorVariableRef: 'editorFg',
          contrastVariableRef: null,
          groupRef: null,
        },
      ],
      colorVariables: [{ key: 'editorFg', groupRef: null }],
      contrastVariables: [],
      groups: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    };
    const catalog = {
      name: 'catalog-a',
      version: '1.0.0',
      type: 'manual' as const,
      locked: false,
      sources: [],
      tokens: [{ key: 'editor.foreground', type: 'theme' as const }],
      semanticTokenTypes: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    };

    expect(isMappingOrphanForTemplate(template, 'editor.foreground', 'theme', [catalog])).toBe(false);
    expect(isMappingOrphanForTemplate(template, 'missing.token', 'theme', [catalog])).toBe(true);
    expect(isMappingOrphanForTemplate(template, 'missing.token', 'theme', [])).toBe(false);
  });

  it('supports template create dialog store transitions', () => {
    const store = new CreateTemplateDialogStore();
    const stateApi = store.getStore();

    stateApi.openCreateTemplateDialog();
    expect(store.getStore().state).toMatchObject({
      isOpen: true,
      isCreating: false,
      name: '',
    });

    stateApi.setCreateTemplateDialogData('template-a');
    stateApi.setIsCreating(true);
    expect(store.getStore().state).toMatchObject({
      isOpen: true,
      isCreating: true,
      name: 'template-a',
    });

    stateApi.closeCreateTemplateDialog('OK');
    expect(store.getStore().state).toMatchObject({
      isOpen: false,
      isCreating: true,
      name: 'template-a',
    });

    stateApi.openCreateTemplateDialog();
    stateApi.closeCreateTemplateDialog('CANCEL');
    expect(store.getStore().state).toBeNull();
  });
});
