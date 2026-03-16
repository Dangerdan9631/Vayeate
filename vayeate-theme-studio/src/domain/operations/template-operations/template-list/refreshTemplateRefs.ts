import type { TemplateReference } from '../../../../model/schemas';
import { templateService } from '../../../../gateway/services/template-service';
import type { SetStoreState } from '../../../state/store-state-reducer';

/** List templates and set entries in store. Single responsibility: refresh ref list. */
export async function refreshTemplateRefs(setStoreState: SetStoreState): Promise<TemplateReference[]> {
  const refs = await templateService.listTemplates();
  setStoreState({
    type: 'SET_STORE_TEMPLATE_ENTRIES',
    entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, template: undefined })),
  });
  return refs;
}


