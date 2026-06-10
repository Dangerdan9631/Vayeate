import { describe, expect, it, vi } from 'vitest';
import { AddGroupAndClearInputController } from '../app/template/groups-card/controllers/add-group-and-clear-input-controller';
import { mergeMappingsFromCatalogData } from './utils/template-catalog-merge';
import { isMappingOrphanForTemplate } from './utils/is-mapping-orphan-for-template';
import { formatSemanticSelector } from '../model/format-semantic-selector';
import { parseSemanticSelector } from '../model/parse-semantic-selector';
import { CreateTemplateDialogStore } from './state/ui/create-template-dialog-store';
import { TemplatesStore } from './state/data/templates-store';
import { TemplateUiStore } from './state/ui/template-ui-store';
import { CatalogUiStore } from './state/ui/catalog-ui-store';
import { ThemeUiStore } from './state/ui/theme-ui-store';
import { BumpTemplateVersionForEditOperation } from './operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { AddGroupToTemplateOperation } from './operations/template-operations/groups/add-group-to-template-operation';

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

  it('adds a trimmed group through template operation ports and clears the input only after success', async () => {
    const templatesStore = new TemplatesStore();
    const templateUiStore = new TemplateUiStore();
    const lockedTemplate = {
      name: 'template-a',
      version: '1.0.0',
      locked: true,
      catalogRefs: [],
      mappings: [],
      colorVariables: [],
      contrastVariables: [],
      groups: ['existing'],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    };
    templatesStore.getStore().updateTemplate(lockedTemplate);
    templateUiStore.getStore().selectTemplate({ name: 'template-a', version: '1.0.0' });
    templateUiStore.getStore().setAddGroupName('  new-group  ');

    const saveTemplate = { execute: vi.fn() };
    const refreshTemplateRefsAndSelect = { execute: vi.fn() };
    const setTemplateAddGroupName = { execute: vi.fn() };
    const recordTemplateUndo = { execute: vi.fn(async () => ({ status: 'recorded', entryId: '1' })) };
    const setCurrentUndoStackId = { executeForContext: vi.fn() };
    const controller = new AddGroupAndClearInputController(
      templatesStore,
      templateUiStore,
      new CatalogUiStore(),
      new ThemeUiStore(),
      new BumpTemplateVersionForEditOperation(),
      new AddGroupToTemplateOperation(),
      saveTemplate as never,
      refreshTemplateRefsAndSelect as never,
      setTemplateAddGroupName as never,
      recordTemplateUndo as never,
      setCurrentUndoStackId as never,
    );

    await controller.run();

    expect(saveTemplate.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'template-a',
        version: '1.0.1',
        locked: false,
        groups: ['existing', 'new-group'],
      }),
    );
    expect(refreshTemplateRefsAndSelect.execute).toHaveBeenCalledWith('template-a', '1.0.1', expect.objectContaining({
      name: 'template-a',
      version: '1.0.1',
    }), true);
    expect(setTemplateAddGroupName.execute).toHaveBeenCalledWith('');

    vi.clearAllMocks();
    templateUiStore.getStore().setAddGroupName('existing');

    await controller.run();

    expect(saveTemplate.execute).not.toHaveBeenCalled();
    expect(refreshTemplateRefsAndSelect.execute).not.toHaveBeenCalled();
    expect(setTemplateAddGroupName.execute).not.toHaveBeenCalled();
  });

  it('short-circuits group creation when the selected template or input is stale', async () => {
    const templatesStore = new TemplatesStore();
    const templateUiStore = new TemplateUiStore();
    const saveTemplate = { execute: vi.fn() };
    const refreshTemplateRefsAndSelect = { execute: vi.fn() };
    const setTemplateAddGroupName = { execute: vi.fn() };
    const recordTemplateUndo = { execute: vi.fn(async () => ({ status: 'recorded', entryId: '1' })) };
    const setCurrentUndoStackId = { executeForContext: vi.fn() };
    const controller = new AddGroupAndClearInputController(
      templatesStore,
      templateUiStore,
      new CatalogUiStore(),
      new ThemeUiStore(),
      new BumpTemplateVersionForEditOperation(),
      new AddGroupToTemplateOperation(),
      saveTemplate as never,
      refreshTemplateRefsAndSelect as never,
      setTemplateAddGroupName as never,
      recordTemplateUndo as never,
      setCurrentUndoStackId as never,
    );

    templateUiStore.getStore().setAddGroupName('core');
    await controller.run();

    expect(saveTemplate.execute).not.toHaveBeenCalled();

    const template = {
      name: 'template-a',
      version: '1.0.0',
      locked: false,
      catalogRefs: [],
      mappings: [],
      colorVariables: [],
      contrastVariables: [],
      groups: [],
      semanticTokenModifiers: [],
      semanticTokenLanguages: [],
    };
    templatesStore.getStore().updateTemplate(template);
    templateUiStore.getStore().selectTemplate({ name: 'template-a', version: '1.0.0' });
    templateUiStore.getStore().setAddGroupName('   ');

    await controller.run();

    expect(saveTemplate.execute).not.toHaveBeenCalled();
    expect(refreshTemplateRefsAndSelect.execute).not.toHaveBeenCalled();
    expect(setTemplateAddGroupName.execute).not.toHaveBeenCalled();
  });
});
