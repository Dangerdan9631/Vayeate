import type { Template } from '../../../model/schemas';
import type { SetStoreState } from '../../state/store-state-reducer';
import { saveTemplate as saveTemplateOp, type SetState } from '../../operations/template-operations';
import { refreshRefsAndSelect } from './_helpers';

export async function saveTemplate(
  setState: SetState,
  setStoreState: SetStoreState,
  template: Template,
): Promise<void> {
  await saveTemplateOp(template);
  await refreshRefsAndSelect(setState, setStoreState, template.name, template.version);
}
