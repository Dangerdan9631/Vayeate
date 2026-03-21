import { injectable } from 'tsyringe';
import type { Template } from '../../../../model/schemas';

@injectable()
export class RemoveGroupFromTemplate {
  execute(template: Template, groupName: string): Template {
    return {
      ...template,
      groups: (template.groups ?? []).filter((g) => g !== groupName),
    };
  }
}
