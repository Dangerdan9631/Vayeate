import { injectable } from 'tsyringe';
import type { Template } from '../../../../model/schemas';

@injectable()
export class AddGroupToTemplate {
  execute(template: Template, name: string): Template | null {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const existing = template.groups ?? [];
    if (existing.includes(trimmed)) return null;
    return { ...template, groups: [...existing, trimmed] };
  }
}
