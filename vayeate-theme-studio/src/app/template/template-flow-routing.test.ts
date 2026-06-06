import { describe, expect, it, vi } from 'vitest';
import { TemplateActionHandler } from './actions/template-handler';
import { TemplatePageActionType } from './template-page/actions/template-page-action-type';
import { TemplatesCardActionType } from './templates-card/actions/templates-card-action-type';
import { TemplateDetailsCardActionType } from './template-details-card/actions/template-details-card-action-type';
import { TemplateCatalogsCardActionType } from './template-catalogs-card/actions/template-catalogs-card-action-type';
import { GroupsCardActionType } from './groups-card/actions/groups-card-action-type';
import { VariablesCardActionType } from './variables-card/actions/variables-card-action-type';
import { MappingsCardActionType } from './mappings-card/actions/mappings-card-action-type';
import { TemplatePageHandler } from './template-page/actions/template-page-handler';
import { TemplatesCardHandler } from './templates-card/actions/templates-card-handler';
import { TemplateDetailsCardHandler } from './template-details-card/actions/template-details-card-handler';
import { TemplateCatalogsCardHandler } from './template-catalogs-card/actions/template-catalogs-card-handler';
import { GroupsCardHandler } from './groups-card/actions/groups-card-handler';
import { VariablesCardHandler } from './variables-card/actions/variables-card-handler';
import { MappingsCardHandler } from './mappings-card/actions/mappings-card-handler';
import type { LoggerFactory } from '../../domain/utils/logger';

function createLoggerFactory(): LoggerFactory {
  return {
    create: () => ({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      category: 'test',
    }),
  } as unknown as LoggerFactory;
}

describe('template flow routing', () => {
  it('routes template page and cards to the expected controllers', async () => {
    const loadTemplatePage = { run: vi.fn() };
    const pageHandler = new TemplatePageHandler(loadTemplatePage as never, createLoggerFactory());
    await pageHandler.handle({ type: TemplatePageActionType.PageOnLoad });
    expect(loadTemplatePage.run).toHaveBeenCalledTimes(1);

    const templatesDeps = {
      openCreateDialog: { run: vi.fn() },
      selectTemplateAndLoad: { run: vi.fn(async () => {}) },
    };
    const templatesHandler = new TemplatesCardHandler(
      templatesDeps.openCreateDialog as never,
      templatesDeps.selectTemplateAndLoad as never,
      createLoggerFactory(),
    );
    await templatesHandler.handle({
      type: TemplatesCardActionType.TemplatesListOnCommit,
      name: 'template-a',
      version: '1.0.0',
    });
    await templatesHandler.handle({ type: TemplatesCardActionType.TemplatesCreateButtonOnClick });
    expect(templatesDeps.selectTemplateAndLoad.run).toHaveBeenCalledWith('template-a', '1.0.0');
    expect(templatesDeps.openCreateDialog.run).toHaveBeenCalledTimes(1);
  });

  it('routes details, catalogs, groups, variables, and mappings actions', async () => {
    const detailsDeps = {
      deleteCurrentTemplateVersion: { run: vi.fn(async () => {}) },
      lockTemplate: { run: vi.fn() },
    };
    const detailsHandler = new TemplateDetailsCardHandler(
      detailsDeps.deleteCurrentTemplateVersion as never,
      detailsDeps.lockTemplate as never,
      createLoggerFactory(),
    );
    await detailsHandler.handle({ type: TemplateDetailsCardActionType.DeleteVersionButtonOnClick });
    await detailsHandler.handle({ type: TemplateDetailsCardActionType.LockButtonOnClick });
    expect(detailsDeps.deleteCurrentTemplateVersion.run).toHaveBeenCalledTimes(1);
    expect(detailsDeps.lockTemplate.run).toHaveBeenCalledTimes(1);

    const catalogDeps = {
      changeCatalogVersion: { run: vi.fn(async () => {}) },
      toggleCatalog: { run: vi.fn(async () => {}) },
      updateAllCatalogs: { run: vi.fn(async () => {}) },
    };
    const catalogsHandler = new TemplateCatalogsCardHandler(
      catalogDeps.changeCatalogVersion as never,
      catalogDeps.toggleCatalog as never,
      catalogDeps.updateAllCatalogs as never,
      createLoggerFactory(),
    );
    await catalogsHandler.handle({ type: TemplateCatalogsCardActionType.UpdateAllButtonOnClick });
    await catalogsHandler.handle({
      type: TemplateCatalogsCardActionType.CatalogCheckboxOnToggle,
      catalogName: 'catalog-a',
    });
    await catalogsHandler.handle({
      type: TemplateCatalogsCardActionType.CatalogVersionListOnCommit,
      catalogName: 'catalog-a',
      value: '1.0.1',
    });
    expect(catalogDeps.updateAllCatalogs.run).toHaveBeenCalledTimes(1);
    expect(catalogDeps.toggleCatalog.run).toHaveBeenCalledWith('catalog-a');
    expect(catalogDeps.changeCatalogVersion.run).toHaveBeenCalledWith('catalog-a', '1.0.1');

    const groupDeps = {
      addGroupAndClearInput: { run: vi.fn(async () => {}) },
      removeGroup: { run: vi.fn(async () => {}) },
      setTemplateAddGroupName: { run: vi.fn(async () => {}) },
    };
    const groupsHandler = new GroupsCardHandler(
      groupDeps.addGroupAndClearInput as never,
      groupDeps.removeGroup as never,
      groupDeps.setTemplateAddGroupName as never,
      createLoggerFactory(),
    );
    await groupsHandler.handle({ type: GroupsCardActionType.GroupAddTextOnChange, value: 'core' });
    await groupsHandler.handle({ type: GroupsCardActionType.GroupAddButtonOnClick });
    await groupsHandler.handle({ type: GroupsCardActionType.GroupRemoveButtonOnClick, groupId: 'core' });
    expect(groupDeps.setTemplateAddGroupName.run).toHaveBeenCalledWith('core');
    expect(groupDeps.addGroupAndClearInput.run).toHaveBeenCalledTimes(1);
    expect(groupDeps.removeGroup.run).toHaveBeenCalledWith('core');

    const variableDeps = {
      addVariable: { run: vi.fn(async () => {}) },
      removeVariable: { run: vi.fn(async () => {}) },
      setTemplateAddVariableName: { run: vi.fn(async () => {}) },
      setVariablesSearchText: { run: vi.fn(async () => {}) },
      updateContrastComparisonSource: { run: vi.fn(async () => {}) },
      updateVariableGroupRef: { run: vi.fn(async () => {}) },
    };
    const variablesHandler = new VariablesCardHandler(
      variableDeps.addVariable as never,
      variableDeps.removeVariable as never,
      variableDeps.setTemplateAddVariableName as never,
      variableDeps.setVariablesSearchText as never,
      variableDeps.updateContrastComparisonSource as never,
      variableDeps.updateVariableGroupRef as never,
      createLoggerFactory(),
    );
    await variablesHandler.handle({ type: VariablesCardActionType.VariablesSearchTextOnChange, value: 'editor' });
    await variablesHandler.handle({
      type: VariablesCardActionType.VariablesAddVariableButtonOnClick,
      groupRef: 'core',
      variableKind: 'color',
    });
    await variablesHandler.handle({
      type: VariablesCardActionType.VariablesContrastSourceListOnCommit,
      contrastVariableKey: 'contrastMain',
      value: 'editorFg',
    });
    expect(variableDeps.setVariablesSearchText.run).toHaveBeenCalledWith('editor');
    expect(variableDeps.addVariable.run).toHaveBeenCalledWith('core', 'color');
    expect(variableDeps.updateContrastComparisonSource.run).toHaveBeenCalledWith('contrastMain', 'editorFg');

    const mappingDeps = {
      addSemanticVariant: { run: vi.fn(async () => {}) },
      removeMapping: { run: vi.fn(async () => {}) },
      setMappingColorRef: { run: vi.fn(async () => {}) },
      setMappingColorVariableFilter: { run: vi.fn(async () => {}) },
      setMappingContrastRef: { run: vi.fn(async () => {}) },
      setMappingContrastVariableFilter: { run: vi.fn(async () => {}) },
      setMappingGroupRef: { run: vi.fn(async () => {}) },
      setMappingSearchText: { run: vi.fn(async () => {}) },
      updateSemanticVariantKey: { run: vi.fn(async () => {}) },
    };
    const mappingsHandler = new MappingsCardHandler(
      mappingDeps.addSemanticVariant as never,
      mappingDeps.removeMapping as never,
      mappingDeps.setMappingColorRef as never,
      mappingDeps.setMappingColorVariableFilter as never,
      mappingDeps.setMappingContrastRef as never,
      mappingDeps.setMappingContrastVariableFilter as never,
      mappingDeps.setMappingGroupRef as never,
      mappingDeps.setMappingSearchText as never,
      mappingDeps.updateSemanticVariantKey as never,
      createLoggerFactory(),
    );
    await mappingsHandler.handle({ type: MappingsCardActionType.MappingSearchTextOnChange, value: 'editor' });
    await mappingsHandler.handle({
      type: MappingsCardActionType.MappingExistingTokenColorVariableListOnCommit,
      tokenKey: 'editor.foreground',
      tokenType: 'theme',
      value: 'editorFg',
    });
    await mappingsHandler.handle({
      type: MappingsCardActionType.MappingSemanticTokenAddVariantButtonOnClick,
      semanticType: 'variable',
      defaultGroupRef: 'core',
    });
    expect(mappingDeps.setMappingSearchText.run).toHaveBeenCalledWith('editor');
    expect(mappingDeps.setMappingColorRef.run).toHaveBeenCalledWith('editor.foreground', 'theme', 'editorFg');
    expect(mappingDeps.addSemanticVariant.run).toHaveBeenCalledWith('variable', 'core');
  });

  it('dispatches top-level template actions to the matching sub-handler', async () => {
    const deps = {
      templatePageHandler: { handle: vi.fn() },
      templatesCardHandler: { handle: vi.fn() },
      templateCreateDialogHandler: { handle: vi.fn() },
      templateDetailsCardHandler: { handle: vi.fn() },
      templateCatalogsCardHandler: { handle: vi.fn() },
      mappingsCardHandler: { handle: vi.fn() },
      groupsCardHandler: { handle: vi.fn() },
      variablesCardHandler: { handle: vi.fn() },
    };
    const handler = new TemplateActionHandler(
      createLoggerFactory(),
      deps.templatePageHandler as never,
      deps.templatesCardHandler as never,
      deps.templateCreateDialogHandler as never,
      deps.templateDetailsCardHandler as never,
      deps.templateCatalogsCardHandler as never,
      deps.mappingsCardHandler as never,
      deps.groupsCardHandler as never,
      deps.variablesCardHandler as never,
    );

    await handler.handle({ type: TemplatePageActionType.PageOnLoad });
    await handler.handle({ type: TemplatesCardActionType.TemplatesCreateButtonOnClick });
    await handler.handle({ type: GroupsCardActionType.GroupAddButtonOnClick });
    await handler.handle({ type: VariablesCardActionType.VariablesSearchTextOnChange, value: 'editor' });

    expect(deps.templatePageHandler.handle).toHaveBeenCalledTimes(1);
    expect(deps.templatesCardHandler.handle).toHaveBeenCalledTimes(1);
    expect(deps.groupsCardHandler.handle).toHaveBeenCalledTimes(1);
    expect(deps.variablesCardHandler.handle).toHaveBeenCalledTimes(1);
  });
});
