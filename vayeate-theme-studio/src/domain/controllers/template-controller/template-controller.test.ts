import { templateSchema } from '../../../model/schemas';
import { createTemplateWithParams } from '../../../model/factories';
import { AddGroupAndClearInputController } from './groups/addGroupAndClearInput';
import { AddVariableController } from './variables/addVariable';
import { RemoveVariableController } from './variables/removeVariable';
import { AddColorVariableController } from './variables-color/addColorVariable';
import { AddContrastVariableController } from './variables-contrast/addContrastVariable';
import { RemoveColorVariableController } from './variables-color/removeColorVariable';
import { RemoveContrastVariableController } from './variables-contrast/removeContrastVariable';
import { initialAppState } from '../../state/app-state';

describe('createTemplateWithParams', () => {
  it('returns an object that satisfies template schema', () => {
    const template = createTemplateWithParams({ name: 'test' });
    const result = templateSchema.safeParse(template);
    expect(result.success).toBe(true);
  });

  it('returns template with the given name and defaults', () => {
    const template = createTemplateWithParams({ name: 'my-template' });
    expect(template.name).toBe('my-template');
    expect(template.version).toBe('1.0.0');
    expect(template.locked).toBe(false);
    expect(template.catalogRefs).toEqual([]);
    expect(template.mappings).toEqual([]);
    expect(template.colorVariables).toEqual([]);
    expect(template.contrastVariables).toEqual([]);
  });
});

describe('template handler wrapper controllers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('AddGroupAndClearInputController composes addGroup and clears input', async () => {
    const addGroupSpy = vi.fn().mockResolvedValue(undefined);
    const clearSpy = vi.fn();
    const controller = new AddGroupAndClearInputController(
      { run: addGroupSpy } as unknown as InstanceType<typeof import('./groups/addGroup').AddGroupController>,
      { run: clearSpy } as unknown as InstanceType<
        typeof import('./groups/setTemplateAddGroupName').SetTemplateAddGroupNameController
      >,
    );

    await controller.run('new-group');

    expect(addGroupSpy).toHaveBeenCalledWith('new-group');
    expect(clearSpy).toHaveBeenCalledWith('');
  });

  it('AddVariableController routes to contrast variable controller when kind is contrast', async () => {
    const addContrastSpy = vi.fn().mockResolvedValue(undefined);
    const addColorSpy = vi.fn().mockResolvedValue(undefined);
    const controller = new AddVariableController(
      { run: addColorSpy } as unknown as AddColorVariableController,
      { run: addContrastSpy } as unknown as AddContrastVariableController,
    );

    await controller.run('  x  ', null, 'contrast');

    expect(addContrastSpy).toHaveBeenCalledWith('x', null);
    expect(addColorSpy).not.toHaveBeenCalled();
  });

  it('AddVariableController routes to color variable controller when kind is color', async () => {
    const addContrastSpy = vi.fn().mockResolvedValue(undefined);
    const addColorSpy = vi.fn().mockResolvedValue(undefined);
    const controller = new AddVariableController(
      { run: addColorSpy } as unknown as AddColorVariableController,
      { run: addContrastSpy } as unknown as AddContrastVariableController,
    );

    await controller.run('  y  ', 'group-a', 'color');

    expect(addColorSpy).toHaveBeenCalledWith('y', 'group-a');
    expect(addContrastSpy).not.toHaveBeenCalled();
  });

  it('RemoveVariableController routes to removeColorVariable when key is a color variable', async () => {
    const template = {
      ...createTemplateWithParams({ name: 'template-a' }),
      colorVariables: [{ key: 'color.ref', groupRef: null }],
    };
    const getState = vi.fn(() => ({
      ...initialAppState,
      templates: { ...initialAppState.templates, template },
    }));
    const removeColorSpy = vi.fn().mockResolvedValue(undefined);
    const removeContrastSpy = vi.fn().mockResolvedValue(undefined);
    const controller = new RemoveVariableController(
      { current: getState } as any,
      { run: removeColorSpy } as unknown as RemoveColorVariableController,
      { run: removeContrastSpy } as unknown as RemoveContrastVariableController,
    );

    await controller.run('color.ref');

    expect(removeColorSpy).toHaveBeenCalledWith('color.ref');
    expect(removeContrastSpy).not.toHaveBeenCalled();
  });

  it('RemoveVariableController routes to removeContrastVariable when key is not a color variable', async () => {
    const template = {
      ...createTemplateWithParams({ name: 'template-a' }),
      colorVariables: [{ key: 'color.ref', groupRef: null }],
    };
    const getState = vi.fn(() => ({
      ...initialAppState,
      templates: { ...initialAppState.templates, template },
    }));
    const removeColorSpy = vi.fn().mockResolvedValue(undefined);
    const removeContrastSpy = vi.fn().mockResolvedValue(undefined);
    const controller = new RemoveVariableController(
      { current: getState } as any,
      { run: removeColorSpy } as unknown as RemoveColorVariableController,
      { run: removeContrastSpy } as unknown as RemoveContrastVariableController,
    );

    await controller.run('contrast.ref');

    expect(removeContrastSpy).toHaveBeenCalledWith('contrast.ref');
    expect(removeColorSpy).not.toHaveBeenCalled();
  });
});
