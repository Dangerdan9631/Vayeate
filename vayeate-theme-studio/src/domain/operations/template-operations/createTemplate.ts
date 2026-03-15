import type { Template } from '../../../model/schemas';
import { templateService } from '../../../gateway/services/template-service';
import type { SetState } from './types';

export async function createTemplate(
  _setState: SetState,
  params: { name: string },
): Promise<Template> {
  const template = await templateService.createTemplate(params);
  return template;
}
