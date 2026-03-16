import { templateService } from '../../../../gateway/services/template-service';

/** Delete one template version from disk. Single responsibility: delete. */
export async function deleteTemplate(name: string, version: string): Promise<void> {
  await templateService.deleteTemplate(name, version);
}


