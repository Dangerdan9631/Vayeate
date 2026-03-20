import type { Template } from '../../../../model/schemas';

export function removeGroupFromTemplate(template: Template, groupName: string): Template {
  return {
    ...template,
    groups: (template.groups ?? []).filter((g) => g !== groupName),
  };
}
