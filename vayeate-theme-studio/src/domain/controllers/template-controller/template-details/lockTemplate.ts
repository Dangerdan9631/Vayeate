import type { SetStoreState } from '../../../state/store-state-reducer';
import { saveTemplate as saveTemplateOp, type SetState } from '../../../operations/template-operations';
import type { GetState } from '../../../operations/undo-operations';
import { refreshRefsAndSelect } from '../shared-flows';

export async function lockTemplate(setState: SetState, setStoreState: SetStoreState, getState: GetState): Promise<void> {
  const template = getState().templates.template;
  if (!template || template.locked) return;
  await saveTemplateOp({ ...template, locked: true });
  await refreshRefsAndSelect(setState, setStoreState, template.name, template.version);
}


