import type { TemplateReference } from '../../../model/schemas';
import { templateService } from '../../../gateway/services/template-service';
import type { SetState } from './types';

/** List templates and set refs in state. Single responsibility: refresh ref list. */
export async function refreshTemplateRefs(setState: SetState): Promise<TemplateReference[]> {
  const refs = await templateService.listTemplates();
  setState({ type: 'SET_TEMPLATE_REFS', refs });
  return refs;
}
