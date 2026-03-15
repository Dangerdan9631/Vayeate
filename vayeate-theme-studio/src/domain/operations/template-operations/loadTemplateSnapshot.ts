import type { Template } from '../../../model/schemas';
import { templateService } from '../../../gateway/services/template-service';

/** Load template from disk without updating state. Single responsibility: read. */
export async function loadTemplateSnapshot(
  name: string,
  version: string,
): Promise<Template | null> {
  return templateService.loadTemplate(name, version);
}
