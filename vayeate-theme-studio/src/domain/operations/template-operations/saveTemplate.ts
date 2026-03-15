import type { Template } from '../../../model/schemas';
import { templateService } from '../../../gateway/services/template-service';

/** Persist template to disk only. Single responsibility: save. */
export async function saveTemplate(template: Template): Promise<void> {
  await templateService.saveTemplate(template);
}
