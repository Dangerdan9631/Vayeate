import { templateSchema } from '../../../model/schemas';
import { createTemplateWithParams } from '.';
import { addGroupAndClearInput, addVariable, removeVariable } from '.';
import * as groupsController from './groups/addGroup';
import * as groupsFormController from './groups/setTemplateAddGroupName';
import * as colorVariablesController from './variables-color/addColorVariable';
import * as contrastVariablesController from './variables-contrast/addContrastVariable';
import * as removeColorVariablesController from './variables-color/removeColorVariable';
import * as removeContrastVariablesController from './variables-contrast/removeContrastVariable';
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

  it('addGroupAndClearInput composes addGroup and clears input', async () => {
    const setState = vi.fn();
    const setStoreState = vi.fn();
    const getState = vi.fn();
    const addGroupSpy = vi.spyOn(groupsController, 'addGroup').mockResolvedValue(undefined);
    const clearSpy = vi
      .spyOn(groupsFormController, 'setTemplateAddGroupName')
      .mockImplementation(() => {});

    await addGroupAndClearInput(setState, setStoreState, getState, 'new-group');

    expect(addGroupSpy).toHaveBeenCalledWith(setState, setStoreState, getState, 'new-group');
    expect(clearSpy).toHaveBeenCalledWith(setState, '');
  });

  it('addVariable routes to contrast variable controller when kind is contrast', async () => {
    const setState = vi.fn();
    const setStoreState = vi.fn();
    const getState = vi.fn();
    const addContrastSpy = vi
      .spyOn(contrastVariablesController, 'addContrastVariable')
      .mockResolvedValue(undefined);
    const addColorSpy = vi
      .spyOn(colorVariablesController, 'addColorVariable')
      .mockResolvedValue(undefined);

    await addVariable(setState, setStoreState, getState, '  x  ', null, 'contrast');

    expect(addContrastSpy).toHaveBeenCalledWith(setState, setStoreState, getState, 'x', null);
    expect(addColorSpy).not.toHaveBeenCalled();
  });

  it('addVariable routes to color variable controller when kind is color', async () => {
    const setState = vi.fn();
    const setStoreState = vi.fn();
    const getState = vi.fn();
    const addContrastSpy = vi
      .spyOn(contrastVariablesController, 'addContrastVariable')
      .mockResolvedValue(undefined);
    const addColorSpy = vi
      .spyOn(colorVariablesController, 'addColorVariable')
      .mockResolvedValue(undefined);

    await addVariable(setState, setStoreState, getState, '  y  ', 'group-a', 'color');

    expect(addColorSpy).toHaveBeenCalledWith(setState, setStoreState, getState, 'y', 'group-a');
    expect(addContrastSpy).not.toHaveBeenCalled();
  });

  it('removeVariable routes to removeColorVariable when key is a color variable', async () => {
    const setState = vi.fn();
    const setStoreState = vi.fn();
    const template = {
      ...createTemplateWithParams({ name: 'template-a' }),
      colorVariables: [{ key: 'color.ref', groupRef: null }],
    };
    const getState = vi.fn(() => ({
      ...initialAppState,
      templates: { ...initialAppState.templates, template },
    }));
    const removeColorSpy = vi
      .spyOn(removeColorVariablesController, 'removeColorVariable')
      .mockResolvedValue(undefined);
    const removeContrastSpy = vi
      .spyOn(removeContrastVariablesController, 'removeContrastVariable')
      .mockResolvedValue(undefined);

    await removeVariable(setState, setStoreState, getState, 'color.ref');

    expect(removeColorSpy).toHaveBeenCalledWith(setState, setStoreState, getState, 'color.ref');
    expect(removeContrastSpy).not.toHaveBeenCalled();
  });

  it('removeVariable routes to removeContrastVariable when key is not a color variable', async () => {
    const setState = vi.fn();
    const setStoreState = vi.fn();
    const template = {
      ...createTemplateWithParams({ name: 'template-a' }),
      colorVariables: [{ key: 'color.ref', groupRef: null }],
    };
    const getState = vi.fn(() => ({
      ...initialAppState,
      templates: { ...initialAppState.templates, template },
    }));
    const removeColorSpy = vi
      .spyOn(removeColorVariablesController, 'removeColorVariable')
      .mockResolvedValue(undefined);
    const removeContrastSpy = vi
      .spyOn(removeContrastVariablesController, 'removeContrastVariable')
      .mockResolvedValue(undefined);

    await removeVariable(setState, setStoreState, getState, 'contrast.ref');

    expect(removeContrastSpy).toHaveBeenCalledWith(setState, setStoreState, getState, 'contrast.ref');
    expect(removeColorSpy).not.toHaveBeenCalled();
  });
});
