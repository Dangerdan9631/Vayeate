import { templateService } from '../../../gateway/services/template-service';
import type { SetStoreState } from '../../state/store-state-reducer';
import type { SetState } from './types';

/** Load template refs from data dir into store (set template entries from ref list). */
export async function loadTemplateRefs(_setState: SetState, setStoreState: SetStoreState): Promise<void> {
  const refs = await templateService.listTemplates();
  setStoreState({
    type: 'SET_STORE_TEMPLATE_ENTRIES',
    entries: refs.map((r) => ({ name: r.name, version: r.version, isLoaded: false, template: undefined })),
  });
}
