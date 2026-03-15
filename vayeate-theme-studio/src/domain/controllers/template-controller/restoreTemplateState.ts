import type { Template } from '../../../model/schemas';
import type { SetStoreState } from '../../state/store-state-reducer';
import {
  setTemplate,
  setSelectedTemplateRef,
  saveTemplate as saveTemplateOp,
  deleteTemplate as deleteTemplateOp,
  refreshTemplateRefs,
  type SetState,
} from '../../operations/template-operations';

export async function restoreTemplateState(
  setState: SetState,
  setStoreState: SetStoreState,
  template: Template | null,
  deleteTemplateVersionOnRestore?: { name: string; version: string },
): Promise<void> {
  setTemplate(setState, template);
  if (template !== null) {
    setSelectedTemplateRef(setState, {
      name: template.name,
      version: template.version,
    });
    try {
      await saveTemplateOp(template);
    } catch {
      // persist failed
    }
    await refreshTemplateRefs(setStoreState);
  }
  if (deleteTemplateVersionOnRestore) {
    await deleteTemplateOp(
      deleteTemplateVersionOnRestore.name,
      deleteTemplateVersionOnRestore.version,
    );
    await refreshTemplateRefs(setStoreState);
  }
}
