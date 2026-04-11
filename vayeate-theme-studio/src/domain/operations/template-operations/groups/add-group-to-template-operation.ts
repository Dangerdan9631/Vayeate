import { singleton } from 'tsyringe';
import type { Template } from '../../../../model/schemas';

@singleton()
export class AddGroupToTemplateOperation {
  execute(template: Template, name: string): Template | null {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const existing = template.groups ?? [];
    if (existing.includes(trimmed)) return null;
    return { ...template, groups: [...existing, trimmed] };
  }
}
