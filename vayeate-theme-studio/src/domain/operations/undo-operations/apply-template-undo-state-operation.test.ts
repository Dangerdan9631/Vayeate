import { describe, expect, it, vi } from 'vitest';
import { templateSchema } from '../../../model/schema/template-schemas';
import { ApplyTemplateUndoStateOperation } from './apply-template-undo-state-operation';

describe('apply template undo state operation', () => {
  it('updates, selects, saves, and refreshes the template snapshot', () => {
    const template = templateSchema.parse({
      name: 'template-a',
      version: '1.0.0',
      locked: false,
      catalogRefs: [],
      mappings: [],
      colorVariables: [],
      contrastVariables: [],
      groups: [],
    });
    const updateTemplate = vi.fn();
    const selectTemplate = vi.fn();
    const saveTemplate = { execute: vi.fn() };
    const refreshTemplateRefsAndSelect = { execute: vi.fn() };

    new ApplyTemplateUndoStateOperation(
      { getStore: () => ({ updateTemplate, state: { templates: {} } }) } as never,
      { getStore: () => ({ selectTemplate, state: { selectedRef: null } }) } as never,
      saveTemplate as never,
      refreshTemplateRefsAndSelect as never,
    ).execute(template);

    expect(updateTemplate).toHaveBeenCalledWith(template);
    expect(selectTemplate).toHaveBeenCalledWith({ name: 'template-a', version: '1.0.0' });
    expect(saveTemplate.execute).toHaveBeenCalledWith(template);
    expect(refreshTemplateRefsAndSelect.execute).toHaveBeenCalledWith('template-a', '1.0.0', template, false);
  });
});
