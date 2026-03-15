import type { TemplateReference } from '../../../model/schemas';
import { templateService } from '../../../gateway/services/template-service';
import type { SetState } from './types';

export async function loadTemplateRefs(setState: SetState): Promise<TemplateReference[]> {
  const refs = await templateService.listTemplates();
  setState({ type: 'SET_TEMPLATE_REFS', refs });
  return refs;
}
