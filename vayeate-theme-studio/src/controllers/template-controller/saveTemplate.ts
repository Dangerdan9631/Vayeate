import type { Template } from '../../model/schemas';
import { saveTemplate as saveTemplateOp, type SetState } from '../../operations/template-operations';
import { refreshRefsAndSelect } from './_helpers';

export async function saveTemplate(
  setState: SetState,
  template: Template,
): Promise<void> {
  await saveTemplateOp(template);
  await refreshRefsAndSelect(setState, template.name, template.version);
}
