import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schema/template-schemas';

@singleton()
export class RemoveGroupFromTemplateOperation {
  execute(template: Template, groupName: string): Template {
    return {
      ...template,
      groups: (template.groups ?? []).filter((g) => g !== groupName),
    };
  }
}
