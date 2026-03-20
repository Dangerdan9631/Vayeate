import type { Template } from '../../../../model/schemas';

export function lockTemplateEntity(template: Template): Template {
  return { ...template, locked: true };
}
