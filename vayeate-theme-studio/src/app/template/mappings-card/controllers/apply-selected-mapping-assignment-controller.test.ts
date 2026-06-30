import { describe, expect, it, vi } from 'vitest';
import { CatalogsStore } from '../../../../domain/catalog/state/catalogs-store';
import { ApplyMappingAssignmentOperation } from '../../../../domain/operations/template-operations/mappings/apply-mapping-assignment-operation';
import { BumpTemplateVersionForEditOperation } from '../../../../domain/operations/template-operations/template-details/bump-template-version-for-edit-operation';
import { TemplatesStore } from '../../../../domain/state/data/templates-store';
import { TemplateUiStore } from '../../../../domain/state/ui/template-ui-store';
import { templateSchema } from '../../../../model/schema/template-schemas';
import { ApplySelectedMappingAssignmentController } from './apply-selected-mapping-assignment-controller';

function setup() {
  const template = templateSchema.parse({
    name: 'test-template',
    version: '1.0.0',
    locked: false,
    catalogRefs: [],
    groups: ['base'],
    colorVariables: [{ key: 'foreground' }],
    contrastVariables: [{ key: 'mainContrast', comparisonSourceRef: 'foreground' }],
    mappings: [
      { token: { key: 'one', type: 'theme' }, groupRef: null, colorVariableRef: null, contrastVariableRef: null },
      { token: { key: 'two', type: 'textmate token' }, groupRef: null, colorVariableRef: null, contrastVariableRef: null },
    ],
  });
  const templatesStore = new TemplatesStore();
  const templateUiStore = new TemplateUiStore();
  templatesStore.getStore().updateTemplate(template);
  templateUiStore.getStore().selectTemplate({ name: template.name, version: template.version });
  templateUiStore.getStore().setSelectedMappingIds([
    { tokenKey: 'one', tokenType: 'theme' },
    { tokenKey: 'two', tokenType: 'textmate token' },
  ]);
  const saveTemplate = { execute: vi.fn() };
  const refreshTemplateRefsAndSelect = { execute: vi.fn() };
  const recordTemplateUndo = { execute: vi.fn(async () => ({ recorded: true })) };
  const setCurrentUndoStackId = { executeForContext: vi.fn() };
  const controller = new ApplySelectedMappingAssignmentController(
    templatesStore,
    templateUiStore,
    new CatalogsStore(),
    { getStore: () => ({ state: { selectedRef: null } }) } as never,
    { getStore: () => ({ state: { selectedRef: null } }) } as never,
    new ApplyMappingAssignmentOperation(),
    new BumpTemplateVersionForEditOperation(),
    saveTemplate as never,
    refreshTemplateRefsAndSelect as never,
    recordTemplateUndo as never,
    setCurrentUndoStackId as never,
  );
  return {
    template,
    controller,
    saveTemplate,
    refreshTemplateRefsAndSelect,
    recordTemplateUndo,
    setCurrentUndoStackId,
    templateUiStore,
  };
}

describe('ApplySelectedMappingAssignmentController', () => {
  it('saves and records one complete undo transition for all selected mappings', async () => {
    const context = setup();
    await context.controller.run({ kind: 'color', value: 'foreground' });

    expect(context.saveTemplate.execute).toHaveBeenCalledOnce();
    const next = context.saveTemplate.execute.mock.calls[0]?.[0];
    expect(next.mappings.map((mapping: { colorVariableRef: string | null }) => mapping.colorVariableRef))
      .toEqual(['foreground', 'foreground']);
    expect(context.refreshTemplateRefsAndSelect.execute).toHaveBeenCalledOnce();
    expect(context.setCurrentUndoStackId.executeForContext).toHaveBeenCalledOnce();
    expect(context.recordTemplateUndo.execute).toHaveBeenCalledOnce();
    expect(context.recordTemplateUndo.execute).toHaveBeenCalledWith(expect.objectContaining({
      before: context.template,
      after: next,
      description: 'Set 2 mapping color assignments',
    }));
  });

  it('does not save or record a no-op bulk assignment', async () => {
    const context = setup();
    await context.controller.run({ kind: 'contrast', value: null });

    expect(context.saveTemplate.execute).not.toHaveBeenCalled();
    expect(context.refreshTemplateRefsAndSelect.execute).not.toHaveBeenCalled();
    expect(context.recordTemplateUndo.execute).not.toHaveBeenCalled();
    expect(context.setCurrentUndoStackId.executeForContext).not.toHaveBeenCalled();
  });

  it('applies bulk assignment only to selected mappings matching current filters', async () => {
    const context = setup();
    context.templateUiStore.getStore().setMappingSearchText('one');

    await context.controller.run({ kind: 'color', value: 'foreground' });

    const next = context.saveTemplate.execute.mock.calls[0]?.[0];
    expect(next.mappings.map((mapping: { colorVariableRef: string | null }) => mapping.colorVariableRef))
      .toEqual(['foreground', null]);
    expect(context.recordTemplateUndo.execute).toHaveBeenCalledWith(expect.objectContaining({
      description: 'Set 1 mapping color assignments',
    }));
  });
});
