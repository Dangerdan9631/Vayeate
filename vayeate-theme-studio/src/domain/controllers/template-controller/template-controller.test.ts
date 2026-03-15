import { templateSchema } from '../../../model/schemas';
import { createTemplateWithParams } from '.';

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
