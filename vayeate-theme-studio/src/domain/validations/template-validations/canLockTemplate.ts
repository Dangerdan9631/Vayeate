import type { Template } from '../../../model/schemas';

export function canLockTemplate(template: Template | null | undefined): template is Template {
  return !!template && !template.locked;
}
